import express from "express";
import dotenv from "dotenv";
dotenv.config();

// Try robust import for Bytez
import Bytez from "bytez.js";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "50mb" }));

const BYTEZ_KEY = process.env.BYTEZ_API_KEY;
const DG_KEY = process.env.DEEPGRAM_API_KEY;
const GATEWAY_PLAYBACK = process.env.GATEWAY_PLAYBACK || "http://localhost:4001/playback";

// Initialize Bytez
let bytez;
try {
    bytez = new Bytez(BYTEZ_KEY);
    console.log("Bytez initialized");
} catch (e) {
    console.error("Bytez init error:", e);
}

app.post("/v1/realtime/input", async (req, res) => {
    const { conversation_id, text } = req.body;
    console.log(`Received input: "${text}"`);

    if (!text) return res.status(400).json({ error: "missing text" });

    try {
        // 1. Get Answer from LLM (Bytez)
        let replyText = "";

        // Choose model - use openai/gpt-4o which works in backend/ai.py
        const model = bytez.model("openai/gpt-4o");

        const messages = [
            { role: "system", content: "You are a helpful, concise voice assistant. Keep replies under 2 sentences." },
            { role: "user", content: text }
        ];

        try {
            const result = await model.run(messages);

            // Debug: log full response structure
            console.log("Bytez raw response:", JSON.stringify(result, null, 2));

            // Based on backend/ai.py: response.output is { role: 'assistant', content: '...' }
            if (result?.output) {
                if (typeof result.output === 'string') {
                    replyText = result.output;
                } else if (result.output?.content) {
                    // This is the expected format: { role: 'assistant', content: '...' }
                    replyText = result.output.content;
                } else {
                    replyText = JSON.stringify(result.output);
                }
            } else if (result?.error) {
                console.error("Bytez API Error:", result.error);
                replyText = "Sorry, the AI service encountered an error.";
            } else {
                console.error("Unknown response format:", result);
                replyText = "I received your message but couldn't generate a response.";
            }

            console.log("LLM Reply:", replyText);
        } catch (llmError) {
            console.error("LLM Error:", llmError);
            replyText = "I'm sorry, I couldn't process that.";
        }

        // 2. Synthesize TTS (Deepgram)
        console.log("Synthesizing TTS...");
        const ttsResp = await fetch("https://api.deepgram.com/v1/speak?model=aura-asteria-en", {
            method: "POST",
            headers: {
                Authorization: `Token ${DG_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: replyText
            })
        });

        if (!ttsResp.ok) {
            const errText = await ttsResp.text();
            console.error("Deepgram TTS Error:", errText);
            throw new Error(`TTS Failed: ${errText}`);
        }

        const ttsArrayBuffer = await ttsResp.arrayBuffer();
        const ttsB64 = Buffer.from(ttsArrayBuffer).toString("base64");
        console.log(`TTS generated (${ttsB64.length} bytes base64)`);

        // 3. Push Audio to Gateway
        console.log(`Pushing audio to Gateway: ${GATEWAY_PLAYBACK}`);
        try {
            const playbackResp = await fetch(GATEWAY_PLAYBACK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio_base64: ttsB64, conversation_id })
            });

            if (!playbackResp.ok) {
                const errText = await playbackResp.text();
                console.error("Gateway Playback Error:", playbackResp.status, errText);
            } else {
                const result = await playbackResp.json();
                console.log("Gateway Playback Success:", result);
            }
        } catch (playbackErr) {
            console.error("Failed to push to Gateway:", playbackErr.message);
        }

        res.json({ ok: true, reply: replyText });

    } catch (err) {
        console.error("Orchestration Error:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Puter orchestration running on http://localhost:${PORT}`));
