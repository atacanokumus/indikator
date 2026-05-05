import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as https from 'https';

const execFileAsync = promisify(execFile);

/**
 * yt-dlp binary'sini /tmp'ye indirir (yoksa) ve yolunu döndürür.
 * Serverless ortamda (Vercel, Cloud Functions) çalışmak için tasarlanmıştır.
 */
let ytDlpDownloadPromise: Promise<string> | null = null;

async function getOrDownloadYtDlp(): Promise<string> {
    if (ytDlpDownloadPromise) {
        return ytDlpDownloadPromise;
    }

    ytDlpDownloadPromise = (async () => {
        const isMac = process.platform === 'darwin';
    const isArm = process.arch === 'arm64';

    let binaryName = 'yt-dlp_linux';
    if (isMac) binaryName = 'yt-dlp_macos';
    else if (isArm) binaryName = 'yt-dlp_linux_aarch64';

    const binaryPath = path.join('/tmp', `yt-dlp_bin_${process.arch}`);

    if (!fs.existsSync(binaryPath)) {
        console.log(`[AUDIO DL] Environment: ${process.platform} (${process.arch}). Downloading yt-dlp...`);

        await new Promise((resolve, reject) => {
            const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

            const download = (reqUrl: string) => {
                https.get(reqUrl, (res) => {
                    if (res.statusCode === 301 || res.statusCode === 302) {
                        return download(res.headers.location!);
                    }
                    if (res.statusCode !== 200) {
                        return reject(new Error(`Failed to download yt-dlp: ${res.statusCode}`));
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
        console.log(`[AUDIO DL] yt-dlp downloaded: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

        if (stats.size < 5_000_000) {
            fs.unlinkSync(binaryPath);
            throw new Error(`[AUDIO DL] Downloaded file too small (${stats.size} bytes). Redirect failed?`);
        }
    }
    return binaryPath;
    })();

    try {
        return await ytDlpDownloadPromise;
    } catch (error) {
        ytDlpDownloadPromise = null; // Hata durumunda kilidi aç, tekrar denenebilsin
        throw error;
    }
}

/**
 * YouTube videosunun sesini MP3 formatında indirir ve Buffer olarak döndürür.
 * Geçici dosya /tmp/{videoId}.mp3 olarak oluşturulur, okunur ve silinir.
 *
 * @param videoId - YouTube video ID
 * @returns Audio dosyasının Buffer'ı
 */
export async function downloadAudioFromVideo(videoId: string): Promise<{ audioBuffer: Buffer; mimeType: string }> {
    const outputPathBase = path.join('/tmp', `${videoId}`);

    try {
        // Eğer önceki deneme kalıntısı varsa sil
        if (fs.existsSync(`${outputPathBase}.m4a`)) fs.unlinkSync(`${outputPathBase}.m4a`);
        if (fs.existsSync(`${outputPathBase}.webm`)) fs.unlinkSync(`${outputPathBase}.webm`);
        if (fs.existsSync(`${outputPathBase}.opus`)) fs.unlinkSync(`${outputPathBase}.opus`);

        const binPath = await getOrDownloadYtDlp();
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        console.log(`[AUDIO DL] Downloading audio for ${videoId}...`);

        // yt-dlp ile native en düşük ses formatını indir (ffmpeg dönüşümü yapma)
        await execFileAsync(binPath, [
            videoUrl,
            '-f', 'worstaudio[ext=m4a]/worstaudio',
            '--output', `${outputPathBase}.%(ext)s`,
            '--no-playlist',
            '--no-check-certificates',
            '--no-warnings'
        ], {
            timeout: 120_000, // 2 dakika timeout
            maxBuffer: 10 * 1024 * 1024, // 10MB stdout buffer
        });

        // yt-dlp çıktı dosyasını bul
        const possibleFiles = [
            `${outputPathBase}.m4a`,
            `${outputPathBase}.webm`,
            `${outputPathBase}.opus`,
            `${outputPathBase}.mp3`
        ];

        let actualFile = '';
        for (const f of possibleFiles) {
            if (fs.existsSync(f)) {
                actualFile = f;
                break;
            }
        }

        if (!actualFile) {
            // /tmp dizininde videoId ile başlayan dosya ara
            const tmpFiles = fs.readdirSync('/tmp');
            const matchingFile = tmpFiles.find(f => f.startsWith(videoId));
            if (matchingFile) {
                actualFile = path.join('/tmp', matchingFile);
            }
        }

        if (!actualFile) {
            throw new Error(`Audio file not found after yt-dlp extraction for ${videoId}`);
        }

        const audioBuffer = fs.readFileSync(actualFile);
        const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);
        console.log(`[AUDIO DL] Audio downloaded: ${fileSizeMB} MB (${actualFile})`);

        // Geçici dosyayı temizle
        try { fs.unlinkSync(actualFile); } catch { /* ignore */ }

        if (audioBuffer.length < 1000) {
            throw new Error(`Audio file too small for ${videoId} (${audioBuffer.length} bytes)`);
        }

        let mimeType = "audio/mp4"; // varsayılan m4a
        if (actualFile.endsWith(".webm")) mimeType = "audio/webm";
        if (actualFile.endsWith(".opus")) mimeType = "audio/ogg";
        if (actualFile.endsWith(".mp3")) mimeType = "audio/mpeg";

        return { audioBuffer, mimeType };
    } catch (error: any) {
        // Temizlik
        try { fs.unlinkSync(`${outputPathBase}.m4a`); } catch { /* ignore */ }
        try { fs.unlinkSync(`${outputPathBase}.webm`); } catch { /* ignore */ }
        console.error(`[AUDIO DL] Failed for ${videoId}:`, error.message);
        throw error;
    }
}
