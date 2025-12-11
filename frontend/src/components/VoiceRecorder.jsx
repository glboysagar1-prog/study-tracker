import React, { useState, useRef, useCallback } from 'react';

/**
 * VoiceRecorder component for recording voice and transcribing to text
 * Uses browser MediaRecorder API and Deepgram for transcription
 */
const VoiceRecorder = ({ onTranscript, disabled = false }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setIsProcessing(true);
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                try {
                    // Convert to base64 and send to backend for transcription
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result.split(',')[1];

                        try {
                            // Use the backend voice API for transcription
                            const response = await fetch('/api/voice/transcribe', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ audio_base64: base64Audio })
                            });

                            if (response.ok) {
                                const data = await response.json();
                                if (data.text) {
                                    onTranscript(data.text);
                                }
                            } else {
                                console.error('Transcription failed:', await response.text());
                            }
                        } catch (err) {
                            console.error('Transcription error:', err);
                        } finally {
                            setIsProcessing(false);
                        }
                    };
                } catch (err) {
                    console.error('Audio processing error:', err);
                    setIsProcessing(false);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please check permissions.');
        }
    }, [onTranscript]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled || isProcessing}
            className={`
        p-3 rounded-lg transition-all flex items-center gap-2
        ${isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/50 dark:text-indigo-300'
                }
        ${isProcessing ? 'opacity-50 cursor-wait' : ''}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
            title={isRecording ? 'Stop Recording' : 'Start Voice Answer'}
        >
            {isProcessing ? (
                <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-medium">Transcribing...</span>
                </>
            ) : isRecording ? (
                <>
                    <span className="material-icons text-lg">stop</span>
                    <span className="text-sm font-medium">Stop</span>
                </>
            ) : (
                <>
                    <span className="material-icons text-lg">mic</span>
                    <span className="text-sm font-medium">Voice Answer</span>
                </>
            )}
        </button>
    );
};

export default VoiceRecorder;
