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
const GROQ_KEY = process.env.GROQ_API_KEY;
const GATEWAY_PLAYBACK = process.env.GATEWAY_PLAYBACK || "http://localhost:4001/playback";

// Initialize Bytez (fallback)
let bytez;
try {
    bytez = new Bytez(BYTEZ_KEY);
    console.log("Bytez initialized (fallback)");
} catch (e) {
    console.error("Bytez init error:", e);
}

// Groq API call function (primary - super fast!)
async function callGroq(messages) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messages,
            max_tokens: 150,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Groq API error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}

app.post("/v1/realtime/input", async (req, res) => {
    const { conversation_id, text } = req.body;
    console.log(`Received input: "${text}"`);

    if (!text) return res.status(400).json({ error: "missing text" });

    try {
        // 1. Get Answer from LLM
        let replyText = "";

        const messages = [
            { role: "system", content: "You are a helpful, concise voice assistant. Keep replies under 2 sentences." },
            { role: "user", content: text }
        ];

        // Try Groq first (super fast!), then fall back to Bytez
        if (GROQ_KEY) {
            try {
                console.log("Trying Groq API (llama-3.3-70b-versatile)...");
                replyText = await callGroq(messages);
                console.log("Groq Success:", replyText);
            } catch (groqErr) {
                console.warn("Groq failed:", groqErr.message);
            }
        }

        // Fallback to Bytez if Groq failed or no key
        if (!replyText && bytez) {
            const modelList = [
                "openai/gpt-4o",
                "meta-llama/Llama-3.3-70B-Instruct-Turbo"
            ];

            for (const modelName of modelList) {
                if (replyText) break;
                try {
                    console.log(`Trying Bytez model: ${modelName}`);
                    const model = bytez.model(modelName);
                    const result = await model.run(messages);

                    if (result?.error) {
                        console.warn(`Model ${modelName} error:`, result.error);
                        continue;
                    }

                    if (result?.output?.content) {
                        replyText = result.output.content;
                    } else if (typeof result?.output === 'string') {
                        replyText = result.output;
                    }
                } catch (modelErr) {
                    console.warn(`Model ${modelName} failed:`, modelErr.message);
                }
            }
        }

        if (!replyText) {
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
