
const { YoutubeTranscript } = require('youtube-transcript');

async function test() {
    try {
        const videoId = 'dQw4w9WgXcQ'; // Rick Roll
        console.log("Fetching transcript for:", videoId);
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log("Success! Items:", transcript.length);
        if (transcript.length > 0) {
            console.log("First item:", transcript[0]);
        }
    } catch (e) {
        console.error("Failed:", e);
    }
}

test();
