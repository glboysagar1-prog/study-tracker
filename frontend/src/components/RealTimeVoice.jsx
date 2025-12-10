import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RealTimeVoice = () => {
    const [status, setStatus] = useState('Disconnected');
    const [transcript, setTranscript] = useState('Waiting to start...');
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState('');

    // Refs for persistent objects
    const wsRef = useRef(null);
    const recorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);

    // Get Gateway URL from env or default to localhost for dev
    const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || "ws://localhost:4000";

    const playAudio = async (arrayBuffer) => {
        setStatus("Playing AI Reply...");
        try {
            // Re-use or create context
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioContextRef.current;

            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start(0);
            source.onended = () => { setStatus("Listening..."); };
        } catch (e) {
            console.error("Audio playback error", e);
            setError("Playback failed");
        }
    };

    const startRecording = async () => {
        setError('');
        setStatus("Connecting...");

        try {
            const ws = new WebSocket(GATEWAY_URL);
            wsRef.current = ws;
            ws.binaryType = "arraybuffer";

            ws.onopen = () => {
                setStatus("Connected. Speak now.");
                ws.send(JSON.stringify({ type: "start" }));
                setIsRecording(true);
            };

            ws.onerror = (e) => {
                console.error("WS Error", e);
                setError("Connection Failed. Is the Gateway server running?");
                setStatus("Error");
            };

            ws.onclose = () => {
                if (isRecording) {
                    setStatus("Disconnected");
                    setIsRecording(false);
                }
            };

            ws.onmessage = (ev) => {
                if (ev.data instanceof ArrayBuffer) {
                    playAudio(ev.data);
                    return;
                }

                try {
                    const obj = JSON.parse(ev.data);
                    if (obj.type === "partial_transcript") {
                        setTranscript(">> " + obj.text);
                    } else if (obj.type === "final_transcript") {
                        setTranscript((prev) => ">> [FINAL]: " + obj.text + "\n(Processing reply...)");
                        setStatus("AI is thinking...");
                    }
                } catch (e) { }
            };

            // Audio Capture
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const captureCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const source = captureCtx.createMediaStreamSource(stream);
            const processor = captureCtx.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(captureCtx.destination);

            processor.onaudioprocess = (e) => {
                if (ws.readyState !== WebSocket.OPEN) return;

                const inputData = e.inputBuffer.getChannelData(0);
                const buffer = new ArrayBuffer(inputData.length * 2);
                const view = new DataView(buffer);
                for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
                }
                ws.send(buffer);
            };

            recorderRef.current = { processor, source, context: captureCtx };

        } catch (err) {
            console.error("Start Error", err);
            setError("Could not start recording: " + err.message);
        }
    };

    const stopRecording = () => {
        setStatus("Stopped");
        setIsRecording(false);

        if (recorderRef.current) {
            recorderRef.current.source.disconnect();
            recorderRef.current.processor.disconnect();
            recorderRef.current.context.close();
            recorderRef.current = null;
        }

        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Real-Time Voice Chat</h2>

                <div className="flex justify-center mb-6">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`px-8 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {isRecording ? 'Stop Conversation' : 'Start Conversation'}
                    </button>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 mb-4 min-h-[150px] border border-gray-200">
                    <p className="font-mono whitespace-pre-wrap text-gray-700">{transcript}</p>
                </div>

                <div className="text-center text-sm font-medium mb-2">
                    Status: <span className={isRecording ? 'text-green-600' : 'text-gray-500'}>{status}</span>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center text-sm">
                        {error}
                    </div>
                )}

                <div className="mt-6 text-xs text-gray-500 text-center">
                    Powered by Deepgram & Bytez (GPT-4o)
                </div>
            </div>
        </div>
    );
};

export default RealTimeVoice;
