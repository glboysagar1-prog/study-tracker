"""
Voice processing module for GTU Exam Preparation Application
Using Bytez SDK for Whisper and TTS with audio format conversion
"""
import os
import tempfile
import subprocess
from bytez import Bytez

class VoiceProcessor:
    def __init__(self):
        self.client = None
        
        # Initialize Bytez client if API key is available
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        if bytez_api_key:
            self.client = Bytez(bytez_api_key)
    
    def transcribe_audio(self, audio_file_path, language="en"):
        """
        Transcribe audio using Bytez (OpenAI Whisper Large V3)
        Converts WebM to WAV format using ffmpeg before processing
        """
        converted_path = None
        try:
            if not self.client:
                raise Exception("Bytez client not initialized. Check BYTEZ_API_KEY in .env file.")
            
            # Convert WebM to WAV format using ffmpeg for better compatibility
            try:
                # Create temporary WAV file
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
                    converted_path = temp_wav.name
                
                # Use ffmpeg to convert audio
                subprocess.run([
                    'ffmpeg', '-y', '-i', audio_file_path,
                    '-acodec', 'pcm_s16le',
                    '-ar', '16000',
                    '-ac', '1',
                    converted_path
                ], check=True, capture_output=True)
                
                # Use converted WAV file for transcription
                file_to_transcribe = converted_path
            except Exception as conv_error:
                # If conversion fails, try original file
                print(f"Audio conversion warning: {conv_error}. Using original file.")
                file_to_transcribe = audio_file_path
            
            # Read file and convert to base64 data URI to avoid "Incorrect padding" error
            import base64
            with open(file_to_transcribe, "rb") as audio_file:
                audio_content = audio_file.read()
                base64_audio = base64.b64encode(audio_content).decode('utf-8')
                # Create data URI (assuming WAV if converted, or try to detect)
                # Bytez seems to handle data URIs well for other models
                if file_to_transcribe.endswith('.wav'):
                    mime_type = 'audio/wav'
                elif file_to_transcribe.endswith('.webm'):
                    mime_type = 'audio/webm'
                else:
                    mime_type = 'audio/wav' # Default fallback
                
                data_uri = f"data:{mime_type};base64,{base64_audio}"

            # Choose whisper-large-v3 model
            model = self.client.model("openai/whisper-large-v3")
            
            # Run transcription - Pass Data URI
            result = model.run(data_uri)
            
            # Clean up converted file
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            
            # Check for errors in Response object
            if result.error:
                raise Exception(f"Bytez API error: {result.error}")
            
            # Extract text from output attribute
            output = result.output
            if isinstance(output, dict):
                return output.get('text', str(output))
            elif isinstance(output, str):
                return output
            else:
                return str(output)
            
        except Exception as e:
            # Clean up converted file on error
            if converted_path and os.path.exists(converted_path):
                os.unlink(converted_path)
            raise Exception(f"Voice transcription failed: {str(e)}")
    
    def text_to_speech(self, text, voice="alloy"):
        """
        Convert text to speech using Bytez (OpenAI TTS)
        """
        try:
            if not self.client:
                raise Exception("Bytez client not initialized. Check BYTEZ_API_KEY in .env file.")
            
            # Choose tts-1 model
            model = self.client.model("openai/tts-1")
            
            # Run TTS - Bytez returns Response object
            result = model.run(text, {"voice": voice})
            
            # Check for errors in Response object
            if result.error:
                raise Exception(f"Bytez API error: {result.error}")
            
            # Return audio content from output attribute
            output = result.output
            
            # Handle different output types
            if isinstance(output, str):
                # Check if it's base64 (common for APIs)
                try:
                    import base64
                    # simple check if likely base64
                    return base64.b64decode(output)
                except Exception:
                    # If not valid base64, maybe it's a URL or raw text error
                    # But for now, try encoding to bytes if it looks like raw data was decoded to str (rare for audio)
                    return output.encode('utf-8')
            elif isinstance(output, bytes):
                return output
            else:
                # Fallback
                return str(output).encode('utf-8')
            
        except Exception as e:
            import logging
            logging.error(f"TTS Error Details: {str(e)}")
            raise Exception(f"Text-to-speech failed: {str(e)}")

# Global voice processor instance
voice_processor = VoiceProcessor()