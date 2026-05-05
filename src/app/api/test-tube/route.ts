import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import * as https from 'https';

const execFileAsync = promisify(execFile);

export async function GET() {
    try {
        const isMac = process.platform === 'darwin';
        const isArm = process.arch === 'arm64';

        let binaryName = 'yt-dlp_linux';
        if (isMac) binaryName = 'yt-dlp_macos';
        else if (isArm) binaryName = 'yt-dlp_linux_aarch64';

        const binaryPath = path.join('/tmp', `yt-dlp_bin_${process.arch}`);

        let logs: string[] = [];
        logs.push(`Environment: ${process.platform} (${process.arch}). Target binary: ${binaryName}`);

        if (!fs.existsSync(binaryPath)) {
            logs.push("Binary missing, downloading via HTTPS stream...");

            await new Promise((resolve, reject) => {
                const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${binaryName}`;

                const download = (reqUrl: string) => {
                    https.get(reqUrl, (res) => {
                        if (res.statusCode === 301 || res.statusCode === 302) {
                            return download(res.headers.location!);
                        }
                        if (res.statusCode !== 200) {
                            return reject(new Error(`Download failed: ${res.statusCode}`));
                        }
                        const writer = fs.createWriteStream(binaryPath);
                        res.pipe(writer);
                        writer.on('finish', () => resolve(true));
                        writer.on('error', reject);
                    }).on('error', reject);
                };

                download(url);
            });

            logs.push("Download finished. Chmodding...");
            fs.chmodSync(binaryPath, '755');
            const stats = fs.statSync(binaryPath);
            logs.push(`Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        } else {
            logs.push("Binary exists.");
        }

        logs.push("Executing binary...");
        const { stdout } = await execFileAsync(binaryPath, ["--version"]);
        logs.push("Execution Success! Version: " + stdout.trim());

        return NextResponse.json({ success: true, logs });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message, stack: e.stack }, { status: 500 });
    }
}
