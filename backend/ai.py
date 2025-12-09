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

# Mock OpenAI for Lightning AI if needed
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

# Google Gemini removed as per user request
GOOGLE_AVAILABLE = False
genai = None

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

        # Google Gemini Disabled
        self.gemini_model = None
    
    def generate_response(self, prompt, context="", model_type="gemini", image_parts=None):
        """
        Generate a response using the available AI model.
        Prioritizes Bytez, falls back to mock response if configured.
        """
        try:
            # 1. Bytez Generation (Primary)
            if self.bytez_client:
                try:
                    full_prompt = f"{context}\n\nQuestion: {prompt}" if context else prompt
                    response = self.bytez_client.model("openai/gpt-4o").run(full_prompt)
                    
                    # Handle Bytez response structure
                    if hasattr(response, 'output'):
                        return response.output
                    elif isinstance(response, str):
                        return response
                    else:
                        return str(response)
                        
                except Exception as e:
                    logger.error(f"Bytez generation failed: {e}")
                    # Fallback to mock if Bytez fails
            
            # 2. Google Gemini (Disabled)
            # if self.gemini_model: ...

            # 3. Mock Response
            logger.warning("No AI client initialized. Returning mock response.")
            debug_info = f"[Debug: Key={bool(bytez_api_key)}, Lib={BYTEZ_AVAILABLE}]"
            return f"This is a simulated AI response to your question: '{prompt}'. Please configure BYTEZ_API_KEY. {debug_info}"
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

# Global instance
ai_processor = AIProcessor()