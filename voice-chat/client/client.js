const WS_URL = "ws://localhost:4000";
let ws;
let mediaStream;
let recorder;
let sending = false;

const btn = document.getElementById("btn");
const transcriptDiv = document.getElementById("transcript");
const statusDiv = document.getElementById("status");

btn.onclick = async () => {
    if (!sending) {
        try {
            await start();
            btn.textContent = "Stop";
            sending = true;
        } catch (e) {
            console.error(e);
            statusDiv.textContent = "Error: " + e.message;
        }
    } else {
        stop();
        btn.textContent = "Start";
        sending = false;
    }
};

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

async function playAudio(arrayBuffer) {
    statusDiv.textContent = "Playing AI Reply...";
    try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
        source.onended = () => { statusDiv.textContent = "Listening..."; };
    } catch (e) {
        console.error("Audio playback error", e);
    }
}

async function start() {
    statusDiv.textContent = "Connecting...";

    ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
        statusDiv.textContent = "Connected. Speak now.";
        console.log("WS open");
        ws.send(JSON.stringify({ type: "start" }));
    };

    ws.onerror = (e) => {
        statusDiv.textContent = "WebSocket Error. Is Gateway running?";
        console.error(e);
    };

    ws.onmessage = (ev) => {
        // if binary -> audio playback from TTS
        if (ev.data instanceof ArrayBuffer) {
            console.log("Received audio bytes:", ev.data.byteLength);
            playAudio(ev.data);
            return;
        }

        // text message (transcripts)
        try {
            const obj = JSON.parse(ev.data);
            if (obj.type === "partial_transcript") {
                transcriptDiv.innerText = ">> " + obj.text;
            } else if (obj.type === "final_transcript") {
                transcriptDiv.innerText = ">> [FINAL]: " + obj.text + "\n(Processing reply...)";
                statusDiv.textContent = "AI is thinking...";
            }
        } catch (e) { }
    };

    // Get Audio Stream
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Use ScriptProcessor for raw PCM access (standard in older but reliable for this demo)
    // Worklet is better for production
    const captureAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    const source = captureAudioContext.createMediaStreamSource(mediaStream);
    const processor = captureAudioContext.createScriptProcessor(4096, 1, 1);

    source.connect(processor);
    processor.connect(captureAudioContext.destination);

    processor.onaudioprocess = (e) => {
        if (!sending) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // convert float32 to Int16
        const buffer = new ArrayBuffer(inputData.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < inputData.length; i++) {
            let s = Math.max(-1, Math.min(1, inputData[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(buffer);
        }
    };

    recorder = { processor, source, context: captureAudioContext };
}

function stop() {
    statusDiv.textContent = "Stopped.";
    if (recorder) {
        recorder.source.disconnect();
        recorder.processor.disconnect();
        recorder.context.close();
    }
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    if (ws) ws.close();
    sending = false;
}
