"""
Voice processing module for GTU Exam Preparation Application
Using Bytez SDK for Whisper and TTS with audio format conversion
"""
import os
import tempfile
import subprocess

# Try to import Bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False
    Bytez = None

class VoiceProcessor:
    def __init__(self):
        self.client = None
        
        # Initialize Bytez client if API key is available and library is loaded
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        if bytez_api_key and BYTEZ_AVAILABLE and Bytez:
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
            
            # Choose whisper-large-v3 model
            model = self.client.model("openai/whisper-large-v3")
            
            # Run transcription - Bytez returns Response object
            result = model.run(file_to_transcribe)
            
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
            return result.output
            
        except Exception as e:
            raise Exception(f"Text-to-speech failed: {str(e)}")

# Global voice processor instance
voice_processor = VoiceProcessor()