import os
import tempfile
from flask import jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.api import api_bp
from backend.voice import voice_processor
from backend.ai import ai_processor
from backend.supabase_client import supabase
import logging

# Set up logging
logger = logging.getLogger(__name__)

@api_bp.route('/voice/transcribe', methods=['POST'])
def transcribe_voice():
    """
    Transcribe voice input to text using Whisper Large V3
    """
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Get language preference (default to English)
        language = request.form.get('language', 'en')
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            audio_file.save(tmp_file.name)
            temp_filename = tmp_file.name
        
        try:
            # Transcribe audio
            transcription = voice_processor.transcribe_audio(temp_filename, language)
            
            # Clean up temporary file
            os.unlink(temp_filename)
            
            return jsonify({
                'success': True,
                'transcription': transcription
            }), 200
        except Exception as e:
            # Clean up temporary file
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)
            raise e
            
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        return jsonify({'error': f'Transcription failed: {str(e)}'}), 500

@api_bp.route('/voice/question', methods=['POST'])
def ask_voice_question():
    """
    Ask a question via voice and get an AI-generated answer
    """
    try:
        # Check if audio file is present
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Get language preference (default to English)
        language = request.form.get('language', 'en')
        
        # Save audio file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            audio_file.save(tmp_file.name)
            temp_filename = tmp_file.name
        
        try:
            # Transcribe audio
            question_text = voice_processor.transcribe_audio(temp_filename, language)
            
            # Generate AI response using GPT-4o
            context = "You are an AI tutor helping GTU students prepare for their exams. Provide clear, concise, and accurate explanations."
            ai_response = ai_processor.generate_response(question_text, context)
            
            # Convert response to speech
            # Note: In production, you might want to stream this or handle it differently
            # For now, we'll just return the text response
            response_data = {
                'success': True,
                'question': question_text,
                'answer': ai_response
            }
            
            # Clean up temporary file
            os.unlink(temp_filename)
            
            return jsonify(response_data), 200
        except Exception as e:
            # Clean up temporary file
            if os.path.exists(temp_filename):
                os.unlink(temp_filename)
            raise e
            
    except Exception as e:
        logger.error(f"Voice question error: {str(e)}")
        return jsonify({'error': f'Voice question processing failed: {str(e)}'}), 500

@api_bp.route('/voice/tts', methods=['POST'])
def text_to_speech():
    """
    Convert text to speech
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Convert text to speech
        audio_content = voice_processor.text_to_speech(text)
        
        # Create temporary file for audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as tmp_file:
            tmp_file.write(audio_content)
            temp_filename = tmp_file.name
        
        # Return audio file
        return send_file(
            temp_filename,
            mimetype='audio/mpeg',
            as_attachment=True,
            download_name='response.mp3'
        )
        
    except Exception as e:
        logger.error(f"Text-to-speech error: {str(e)}")
        return jsonify({'error': f'Text-to-speech failed: {str(e)}'}), 500