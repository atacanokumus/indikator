/**
 * YouTube veri erişimi: kanal RSS'i, transkript ve (yedek olarak) ses indirme.
 *
 * Transkript için üç yol denenir:
 *   1. Anonim youtube-transcript kütüphanesi (hızlı)
 *   2. YOUTUBE_COOKIE tanımlıysa kimlikli InnerTube isteği
 *   3. yt-dlp ikilisi (en dayanıklı; /tmp'ye indirilip önbelleklenir)
 */
import { execFile } from "child_process";
import fs from "fs";
import * as https from "https";
import os from "os";
import path from "path";
import { promisify } from "util";
import Parser from "rss-parser";
import { YoutubeTranscript } from "youtube-transcript";
import { decodeHtml } from "@/lib/utils";
import type { VideoInfo } from "@/lib/types-video";

const execFileAsync = promisify(execFile);

const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/* --------------------------- yt-dlp ikilisi --------------------------- */

function ytDlpAssetName(): string {
    if (process.platform === "darwin") return "yt-dlp_macos";
    if (process.arch === "arm64") return "yt-dlp_linux_aarch64";
    return "yt-dlp_linux";
}

async function download(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const go = (u: string, redirects = 0) => {
            if (redirects > 5) return reject(new Error("Çok fazla yönlendirme"));
            https
                .get(u, (res) => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        res.resume();
                        return go(res.headers.location!, redirects + 1);
                    }
                    if (res.statusCode !== 200) {
                        res.resume();
                        return reject(new Error(`İndirme başarısız: HTTP ${res.statusCode}`));
                    }
                    const out = fs.createWriteStream(dest);
                    res.pipe(out);
                    out.on("finish", () => out.close(() => resolve()));
                    out.on("error", reject);
                })
                .on("error", reject);
        };
        go(url);
    });
}

async function getYtDlp(): Promise<string> {
    const binPath = path.join(os.tmpdir(), `yt-dlp_${process.platform}_${process.arch}`);
    if (fs.existsSync(binPath) && fs.statSync(binPath).size > 5_000_000) return binPath;

    const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytDlpAssetName()}`;
    console.log(`[YT] yt-dlp indiriliyor: ${ytDlpAssetName()}`);
    await download(url, binPath);

    const size = fs.statSync(binPath).size;
    if (size < 5_000_000) {
        fs.unlinkSync(binPath);
        throw new Error(`yt-dlp indirilemedi (dosya çok küçük: ${size} bayt)`);
    }
    fs.chmodSync(binPath, 0o755);
    return binPath;
}

/* --------------------------- Transkript --------------------------- */

interface CaptionTrack { baseUrl: string; languageCode: string }

async function transcriptViaCookie(videoId: string, cookie: string): Promise<string | null> {
    const headers = { "User-Agent": UA, "Accept-Language": "tr-TR,tr;q=0.9", Cookie: cookie };

    const page = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers });
    const html = await page.text();
    const apiKey = html.match(/"INNERTUBE_API_KEY":\s*"([\w-]+)"/)?.[1];
    if (!apiKey) return null;

    const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json",
            Origin: "https://www.youtube.com",
            Referer: `https://www.youtube.com/watch?v=${videoId}`,
        },
        body: JSON.stringify({
            context: { client: { clientName: "WEB", clientVersion: "2.20240228.01.00", hl: "tr", gl: "TR" } },
            videoId,
        }),
    });

    const data = (await res.json()) as {
        captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } };
    };
    const tracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks?.length) return null;

    const track = tracks.find((t) => t.languageCode === "tr") ?? tracks[0];
    const xml = await (await fetch(track.baseUrl, { headers })).text();
    const parts = Array.from(xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)).map((m) =>
        decodeHtml(m[1].replace(/<[^>]*>/g, ""))
    );
    return parts.length ? parts.join(" ") : null;
}

interface YtDlpSub { ext: string; url: string }
interface YtDlpInfo {
    subtitles?: Record<string, YtDlpSub[]>;
    automatic_captions?: Record<string, YtDlpSub[]>;
}

function vttToText(text: string): string {
    return text
        .split("\n")
        .filter(
            (line) =>
                !line.includes("-->") &&
                !line.startsWith("WEBVTT") &&
                !line.startsWith("Kind:") &&
                !line.startsWith("Language:") &&
                line.trim() !== ""
        )
        .join(" ")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function json3ToText(text: string): string {
    const parsed = JSON.parse(text) as { events?: { segs?: { utf8: string }[] }[] };
    return (parsed.events ?? [])
        .flatMap((ev) => ev.segs?.map((s) => s.utf8) ?? [])
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
}

async function transcriptViaYtDlp(videoId: string): Promise<string | null> {
    const bin = await getYtDlp();
    const { stdout } = await execFileAsync(
        bin,
        [
            `https://www.youtube.com/watch?v=${videoId}`,
            "--dump-json",
            "--write-auto-subs",
            "--sub-lang", "tr,en",
            "--skip-download",
            "--no-warnings",
        ],
        { maxBuffer: 32 * 1024 * 1024 }
    );

    const info = JSON.parse(stdout) as YtDlpInfo;
    const subs =
        info.subtitles?.tr ?? info.automatic_captions?.tr ?? info.subtitles?.en ?? info.automatic_captions?.en;
    const sub = subs?.find((s) => s.ext === "json3") ?? subs?.find((s) => s.ext === "vtt");
    if (!sub?.url) return null;

    const text = await (await fetch(sub.url)).text();
    const out = sub.ext === "json3" || text.includes("wireMagic") ? json3ToText(text) : vttToText(text);
    return out.length > 10 ? decodeHtml(out) : null;
}

export async function getVideoTranscript(videoId: string): Promise<string> {
    // 1) Anonim kütüphane
    try {
        const raw = await YoutubeTranscript.fetchTranscript(videoId, { lang: "tr" });
        if (raw?.length) return raw.map((i) => decodeHtml(i.text)).join(" ");
    } catch {
        // BotGuard engellemiş olabilir; sıradaki yönteme geç
    }

    // 2) Kimlikli istek (yalnızca cookie tanımlıysa)
    const cookie = process.env.YOUTUBE_COOKIE ?? "";
    if (cookie.length > 10) {
        try {
            const text = await transcriptViaCookie(videoId, cookie);
            if (text) return text;
        } catch (err) {
            console.warn(`[YT] Kimlikli transkript başarısız: ${(err as Error).message}`);
        }
    }

    // 3) yt-dlp
    const text = await transcriptViaYtDlp(videoId);
    if (text) return text;

    throw new Error("Bu videoda altyazı kapalı veya erişilemiyor");
}

/* --------------------------- Ses indirme --------------------------- */

export async function downloadAudioLocally(videoId: string): Promise<string> {
    const bin = await getYtDlp();
    const outputPath = path.join(os.tmpdir(), `${videoId}.m4a`);

    await execFileAsync(
        bin,
        [
            `https://www.youtube.com/watch?v=${videoId}`,
            "-f", "bestaudio[ext=m4a]/bestaudio",
            "--extract-audio",
            "--audio-format", "m4a",
            "--no-warnings",
            "--output", outputPath,
        ],
        { maxBuffer: 32 * 1024 * 1024 }
    );

    if (!fs.existsSync(outputPath)) throw new Error("Ses dosyası oluşturulamadı");
    return outputPath;
}

/* --------------------------- Kanal RSS'i --------------------------- */

interface RssItem {
    id?: string;
    title?: string;
    pubDate?: string;
    "media:group"?: { "media:thumbnail"?: { $?: { url?: string } }[] };
}

const parser: Parser<Record<string, unknown>, RssItem> = new Parser({
    timeout: 10_000,
    customFields: { item: [["yt:videoId", "id"], ["media:group", "media:group"]] },
});

export async function getChannelVideos(
    channelId: string,
    log?: (m: string) => void
): Promise<VideoInfo[]> {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const feed = await parser.parseURL(rssUrl);
        log?.(`[RSS] ${feed.title ?? channelId}: ${feed.items.length} video`);

        return feed.items
            .filter((item) => item.id)
            .map((item) => {
                const id = String(item.id).replace("yt:video:", "");
                return {
                    id,
                    title: decodeHtml(item.title ?? ""),
                    thumbnail:
                        item["media:group"]?.["media:thumbnail"]?.[0]?.$?.url ??
                        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
                    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                };
            });
    } catch (error) {
        const message = (error as Error).message;
        log?.(`[RSS] Hata: ${message}`);
        throw new Error(`Kanal RSS okunamadı: ${message}`);
    }
}
