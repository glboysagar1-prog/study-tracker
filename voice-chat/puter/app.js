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
        // 1. Get Answer from LLM (Bytez) with fallback
        let replyText = "";

        // Models to try in order (fallback for rate limits)
        const modelList = [
            "openai/gpt-4o",
            "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            "mistralai/Mistral-7B-Instruct-v0.3"
        ];

        const messages = [
            { role: "system", content: "You are a helpful, concise voice assistant. Keep replies under 2 sentences." },
            { role: "user", content: text }
        ];

        let success = false;
        for (const modelName of modelList) {
            if (success) break;

            try {
                console.log(`Trying model: ${modelName}`);
                const model = bytez.model(modelName);
                const result = await model.run(messages);

                console.log("Bytez response:", JSON.stringify(result, null, 2));

                // Check for rate limit error
                if (result?.error) {
                    console.warn(`Model ${modelName} error:`, result.error);
                    continue; // Try next model
                }

                // Extract response
                if (result?.output) {
                    if (typeof result.output === 'string') {
                        replyText = result.output;
                    } else if (result.output?.content) {
                        replyText = result.output.content;
                    } else {
                        replyText = JSON.stringify(result.output);
                    }
                    success = true;
                    console.log(`Success with ${modelName}: ${replyText}`);
                }
            } catch (modelErr) {
                console.warn(`Model ${modelName} failed:`, modelErr.message);
            }
        }

        if (!success || !replyText) {
            replyText = "I'm currently experiencing high traffic. Please wait a moment and try again.";
        }

        console.log("LLM Reply:", replyText);


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
