
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const YT_DLP_BINARY = path.join(process.cwd(), "yt-dlp");

export async function downloadVideo(videoId: string, targetPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // -f "b" selects best quality (audio+video). -o targetPath
        const args = [
            `https://www.youtube.com/watch?v=${videoId}`,
            "-f", "best[ext=mp4]/best",
            "-o", targetPath,
            "--no-simulate",
            "--no-warnings"
        ];

        console.log(`Spawning yt-dlp: ${YT_DLP_BINARY} ${args.join(" ")}`);

        if (!fs.existsSync(YT_DLP_BINARY)) {
            return reject(new Error(`yt-dlp binary not found at ${YT_DLP_BINARY}`));
        }

        // Ensure executable
        try {
            fs.chmodSync(YT_DLP_BINARY, '755');
        } catch (e) { /* ignore */ }

        const child = spawn(YT_DLP_BINARY, args);
        let stderr = "";

        child.stdout.on("data", (data) => {
            // console.log(`yt-dlp stdout: ${data}`);
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
            // console.error(`yt-dlp stderr: ${data}`);
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`yt-dlp exited with code ${code}. Stderr: ${stderr}`));
            }
        });
    });
}

export async function downloadTranscript(videoId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        // Use os.tmpdir() for temp files
        const tempId = Math.random().toString(36).substring(7);
        const tempPrefix = path.join(os.tmpdir(), `temp_sub_${tempId}`);

        const args = [
            `https://www.youtube.com/watch?v=${videoId}`,
            "--write-sub",
            "--write-auto-sub", // Try auto-generated too
            "--sub-lang", "en,en-US,en-GB", // Prefer English
            "--skip-download",
            "-o", tempPrefix
        ];

        console.log(`Spawning yt-dlp for subs: ${YT_DLP_BINARY} ${args.join(" ")}`);

        if (!fs.existsSync(YT_DLP_BINARY)) {
            return reject(new Error(`yt-dlp binary not found at ${YT_DLP_BINARY}`));
        }

        const child = spawn(YT_DLP_BINARY, args);
        let stderr = "";

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (code) => {
            // Check for files matching tempPrefix*
            // Usually tempPrefix.en.vtt or tempPrefix.en-US.vtt
            const dir = path.dirname(tempPrefix);
            const base = path.basename(tempPrefix);

            try {
                const files = fs.readdirSync(dir).filter(f => f.startsWith(base));
                console.log(`yt-dlp subs finished. Code: ${code}. Found files: ${files.join(", ")}`);

                if (files.length > 0) {
                    // Read the first one
                    const content = fs.readFileSync(path.join(dir, files[0]), 'utf-8');
                    // Clean up
                    try {
                        files.forEach(f => fs.unlinkSync(path.join(dir, f)));
                    } catch (e) { console.error("Error cleanup subs:", e); }

                    resolve(content);
                } else {
                    // code 0 but no file? maybe no subs.
                    if (code !== 0) {
                        console.warn(`yt-dlp failed with code ${code}. Stderr: ${stderr}`);
                    }
                    resolve("");
                }
            } catch (e) {
                reject(e);
            }
        });
    });
}
