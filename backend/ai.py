import os
import logging
from dotenv import load_dotenv

# Try to import bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False
    Bytez = None

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    genai = None

import logging

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AIProcessor:
    def __init__(self):
        self.bytez_client = None
        self.gemini_model = None
        
        # Initialize Bytez client if API key is available
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        if bytez_api_key and BYTEZ_AVAILABLE:
            try:
                self.bytez_client = Bytez(bytez_api_key)
                logger.info("Bytez client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Bytez: {e}")

        # Initialize Google Gemini if Bytez failed or key not provided
        google_api_key = os.environ.get('GOOGLE_API_KEY')
        if not self.bytez_client and GOOGLE_AVAILABLE and google_api_key:
            try:
                genai.configure(api_key=google_api_key)
                self.gemini_model = genai.GenerativeModel('gemini-flash-latest')
                logger.info("Google Gemini client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini: {e}")
    
    def generate_response(self, prompt, context=None):
        """
        Generate AI response using GPT-4o via Bytez or Gemini
        """
        try:
            # 1. Try Bytez
            if self.bytez_client:
                # Choose gpt-4o model
                logger.info(f"Generating response for prompt: {prompt[:50]}...")
                model = self.bytez_client.model("openai/gpt-4o")
                
                # Prepare messages
                messages = []
                if context:
                    messages.append({"role": "system", "content": context})
                messages.append({"role": "user", "content": prompt})
                
                # Generate response
                logger.info("Calling Bytez API...")
                result = model.run(messages)
                
                if hasattr(result, 'error') and result.error:
                    raise Exception(f"Bytez GPT-4o error: {result.error}")
                
                if hasattr(result, 'output'):
                    return result.output
                return str(result)

            # 2. Try Gemini
            elif self.gemini_model:
                logger.info(f"Generating response using Gemini for prompt: {prompt[:50]}...")
                full_prompt = f"{context}\n\nUser: {prompt}" if context else prompt
                response = self.gemini_model.generate_content(full_prompt)
                return response.text

            # 3. Mock Response
            else:
                logger.warning("No AI client initialized. Returning mock response.")
                return f"This is a simulated AI response to your question: '{prompt}'. Please configure BYETZ_API_KEY or GOOGLE_API_KEY."
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

# Global instance
ai_processor = AIProcessor()