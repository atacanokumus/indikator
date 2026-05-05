import { decodeHtml } from '@/lib/utils';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as https from 'https';
import { YoutubeTranscript } from 'youtube-transcript';
import Parser from 'rss-parser';

export interface VideoInfo {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
}

const execFileAsync = promisify(execFile);

// Helper function to dynamically download yt-dlp binary to /tmp for autonomous serverless execution without RAM bloat
async function getOrDownloadYtDlp(): Promise<string> {
    const isMac = process.platform === 'darwin';
    const isArm = process.arch === 'arm64';

    let binaryName = 'yt-dlp_linux';
    if (isMac) binaryName = 'yt-dlp_macos';
    else if (isArm) binaryName = 'yt-dlp_linux_aarch64';

    const binaryPath = path.join('/tmp', `yt-dlp_bin_${process.arch}`);

    if (!fs.existsSync(binaryPath)) {
        console.log(`[YOUTUBE BINARY] Environment: ${process.platform} (${process.arch}). Streaming via native HTTPS to prevent OOM...`);

        await new Promise((resolve, reject) => {
            const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

            const download = (reqUrl: string) => {
                https.get(reqUrl, (res) => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        return download(res.headers.location!);
                    }
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Failed to download: ${res.statusCode}`));
                    }
                    const writer = fs.createWriteStream(binaryPath);
                    res.pipe(writer);
                    writer.on('finish', () => resolve(true));
                    writer.on('error', reject);
                }).on('error', reject);
            };

            download(url);
        });

        fs.chmodSync(binaryPath, '755');
        const stats = fs.statSync(binaryPath);
        console.log(`[YOUTUBE BINARY] Native HTTPS Streaming complete. Final Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        if (stats.size < 5000000) {
            fs.unlinkSync(binaryPath);
            throw new Error(`[YOUTUBE BINARY] Downloaded file is too small to be a valid binary (${stats.size} bytes). Redirect failed?`);
        }
    }
    return binaryPath;
}

export const getVideoTranscript = async (videoId: string): Promise<string> => {
    try {
        const cookie = process.env.YOUTUBE_COOKIE || "";

        // 1. DUAL-PATH: If Cookie is provided, use the native Authenticated Web Extractor 
        if (cookie.length > 10) {
            console.log(`[YOUTUBE HTTP] Attempting authenticated extraction for ${videoId} using YOUTUBE_COOKIE.`);
            const htmlRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
                headers: {
                    "Accept-Language": "en-US",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Cookie": cookie
                }
            });
            const html = await htmlRes.text();
            const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);

            if (apiKeyMatch) {
                const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKeyMatch[1]}`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Cookie": cookie,
                        "Origin": "https://www.youtube.com",
                        "Referer": `https://www.youtube.com/watch?v=${videoId}`
                    },
                    body: JSON.stringify({
                        context: { client: { clientName: "WEB", clientVersion: "2.20240228.01.00", hl: "en", gl: "US" } },
                        videoId: videoId
                    })
                });

                const data = await res.json();
                const captions = data.captions?.playerCaptionsTracklistRenderer?.captionTracks;

                if (captions && captions.length > 0) {
                    let track = captions.find((t: any) => t.languageCode === 'tr') || captions[0];
                    const xmlRes = await fetch(track.baseUrl, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Cookie": cookie
                        }
                    });
                    const xml = await xmlRes.text();
                    const textMatches = Array.from(xml.matchAll(/<text[^>]*>(.*?)<\/text>/gs));

                    if (textMatches.length > 0) {
                        return textMatches.map(match => decodeHtml(match[1].replace(/<[^>]*>/g, ''))).join(' ');
                    }
                }
            }
            console.log(`[YOUTUBE HTTP] Authenticated extraction returned no text. Falling back to autonomous autonomous logic.`);
        }

        // 2. DEFAULT-PATH: Try anonymous youtube-transcript API
        try {
            const transcriptRaw = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'tr' });
            if (transcriptRaw && transcriptRaw.length > 0) {
                return transcriptRaw.map(item => decodeHtml(item.text)).join(' ');
            }
        } catch (e) {
            console.log(`[YOUTUBE SCRAPER] Standard API blocked by BotGuard. Falling back to Ultimate Binary Extractor.`);
        }

        // 3. ULTIMATE AUTONOMOUS PATH: JIT yt-dlp Binary Extractor
        console.log(`[YOUTUBE BINARY] Initiating autonomous binary extraction for ${videoId}`);
        const binPath = await getOrDownloadYtDlp();

        const { stdout } = await execFileAsync(binPath, [
            "https://www.youtube.com/watch?v=" + videoId,
            "--dump-json",
            "--write-auto-subs",
            "--sub-lang", "tr",
            "--skip-download"
        ]);

        const info = JSON.parse(stdout);
        const subs = info.subtitles?.['tr'] || info.automatic_captions?.['tr'];

        if (subs && subs.length > 0) {
            const vttSub = subs.find((s: any) => s.ext === 'vtt' || s.ext === 'json3');
            if (vttSub && vttSub.url) {
                const res = await fetch(vttSub.url);
                const text = await res.text();

                let transcriptText = "";
                if (vttSub.ext === 'json3' || text.includes('wireMagic')) {
                    const parsed = JSON.parse(text);
                    const segments = [];
                    for (const ev of parsed.events || []) {
                        if (ev.segs) {
                            segments.push(ev.segs.map((s: any) => s.utf8).join(''));
                        }
                    }
                    transcriptText = segments.join(' ').replace(/\s+/g, ' ');
                } else {
                    transcriptText = text
                        .split('\n')
                        .filter(line => !line.includes('-->') && !line.startsWith('WEBVTT') && line.trim() !== '' && !line.startsWith('Kind:') && !line.startsWith('Language:'))
                        .join(' ')
                        .replace(/<[^>]*>/g, '')
                        .replace(/\s+/g, ' ');
                }

                if (transcriptText.length > 10) {
                    console.log(`[YOUTUBE BINARY] Successfully extracted ${transcriptText.length} characters.`);
                    return decodeHtml(transcriptText);
                }
            }
        }

        throw new Error("Transcript is disabled or fully blocked on this video");
    } catch (error: any) {
        console.warn(`[YOUTUBE FATAL] Transcript extraction failed globally for ${videoId}:`, error.message);
        throw error;
    }
};

export const getVideoInfo = async (videoId: string): Promise<VideoInfo | null> => {
    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        const html = await response.text();

        const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
        const title = titleMatch ? decodeHtml(titleMatch[1]) : "Unknown Title";

        return {
            id: videoId,
            title: title,
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            publishedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Video info fetch error:', error);
        return null;
    }
};

type CustomItem = {
    id: string;
    title: string;
    pubDate: string;
    'media:group': {
        'media:thumbnail': {
            '$': {
                url: string;
            }
        }[];
    };
};

const parser = new Parser<any, CustomItem>({
    customFields: {
        item: [
            ['yt:videoId', 'id'],
            ['media:group', 'media:group']
        ]
    }
});

export const getChannelVideos = async (channelId: string, log?: (m: string) => void): Promise<VideoInfo[]> => {
    log?.(`[RSS] Fetching RSS feed for channel: ${channelId}`);

    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
        const feed = await parser.parseURL(rssUrl);
        log?.(`[RSS] Successfully parsed feed: ${feed.title}, total items: ${feed.items.length}`);

        return feed.items.slice(0, 5).map((item: CustomItem) => {
            const videoId = item.id.replace('yt:video:', '');

            return {
                id: videoId,
                title: decodeHtml(item.title),
                thumbnail: item['media:group']?.['media:thumbnail']?.[0]?.['$']?.url || '',
                publishedAt: item.pubDate
            };
        });
    } catch (error: any) {
        log?.(`[RSS] Error fetching feed: ${error.message}`);
        throw new Error(`RSS API Hatası: ${error.message}`);
    }
};
