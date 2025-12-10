import dotenv from "dotenv";
dotenv.config();

import { WebSocketServer, WebSocket } from "ws";
import fetch from "node-fetch";

const DG_KEY = process.env.DEEPGRAM_API_KEY;
const PUTER_URL = process.env.PUTER_URL || "http://localhost:3001";
const PORT = process.env.PORT || 4000;

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
    console.log("Client connected");

    // Open Deepgram streaming connection per client
    // Using 'nova-2' model for better speed/accuracy if available, or 'general'
    const dgUrl = "wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&channels=1&model=nova-2";
    const dgWs = new WebSocket(dgUrl, {
        headers: { Authorization: `Token ${DG_KEY}` }
    });

    dgWs.onopen = () => console.log("Connected to Deepgram");

    dgWs.onmessage = (msg) => {
        let data;
        try { data = JSON.parse(msg.data); } catch (e) { return; }

        if (data.channel && data.channel.alternatives) {
            const alt = data.channel.alternatives[0];
            const obj = {
                type: data.is_final ? "final_transcript" : "partial_transcript",
                text: alt.transcript,
                raw: data
            };

            // forward to client
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(obj));
            }

            // on final, send final transcript to Puter orchestration
            if (data.is_final && alt.transcript.trim().length > 0) {
                console.log("Final transcript:", alt.transcript);
                console.log("Calling Puter at:", `${PUTER_URL}/v1/realtime/input`);

                fetch(`${PUTER_URL}/v1/realtime/input`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ conversation_id: "local-1", text: alt.transcript })
                })
                    .then(resp => {
                        console.log("Puter response status:", resp.status);
                        return resp.json();
                    })
                    .then(data => {
                        console.log("Puter response:", data);
                    })
                    .catch(err => console.error("Puter Error:", err.message));
            }
        }
    };

    dgWs.onerror = (e) => console.error("Deepgram WS err", e);
    dgWs.onclose = () => console.log("Deepgram WS closed");

    // When gateway receives raw audio frames from client, forward to Deepgram binary channel
    ws.on("message", (msg) => {
        // expecting binary audio frames (16-bit PCM little-endian, 16kHz mono)
        if (typeof msg === "string") {
            // possible control message (start/stop)
            try {
                const ctrl = JSON.parse(msg);
                if (ctrl.type === "start") {
                    console.log("Client start");
                }
            } catch (e) { }
            return;
        }

        // forward binary to Deepgram
        if (dgWs.readyState === dgWs.OPEN) {
            dgWs.send(msg);
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        if (dgWs.readyState === dgWs.OPEN) {
            dgWs.close();
        }
    });
});

// small express endpoint to accept TTS audio from Puter and forward to active clients
import express from "express";
const app = express();
app.use(express.json({ limit: "50mb" }));

// naive in-memory list of ws clients (for demo)
const clients = new Set();
wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
});

app.post("/playback", (req, res) => {
    // expecting { audio_base64: "...", conversation_id: "local-1" }
    const { audio_base64 } = req.body;
    if (!audio_base64) return res.status(400).send("missing audio");

    const audioBuf = Buffer.from(audio_base64, "base64");
    console.log(`Broadcasting audio (${audioBuf.length} bytes) to ${clients.size} clients`);

    // forward binary to all connected clients
    for (const c of clients) {
        if (c.readyState === c.OPEN) {
            c.send(audioBuf);
        }
    }
    res.json({ ok: true });
});


// Combined HTTP and WS Server
const server = app.listen(PORT, () => console.log(`Gateway listening on port ${PORT}`));

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
