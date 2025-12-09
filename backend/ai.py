import os
import logging
from dotenv import load_dotenv

# Try to import bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
    logging.info("✓ Bytez library imported successfully")
except ImportError as e:
    BYTEZ_AVAILABLE = False
    Bytez = None
    logging.warning(f"✗ Bytez library import failed: {e}")
    logging.warning("This usually means the bytez package is not installed or has dependency issues")

# Google Gemini removed as per user request
GOOGLE_AVAILABLE = False
genai = None

import logging

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

print("AI Processor initialization...")
print(f"BYTEZ_API_KEY configured: {bool(os.getenv('BYTEZ_API_KEY'))}")
print(f"BYTEZ_LIB_AVAILABLE: {BYTEZ_AVAILABLE}")

class AIProcessor:
    def __init__(self):
        self.bytez_client = None
        self.gemini_model = None
        
        # Initialize Bytez client if API key is available
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        print(f"Initializing AI Processor with BYTEZ_API_KEY: {bool(bytez_api_key)}")
        if bytez_api_key and BYTEZ_AVAILABLE:
            try:
                self.bytez_client = Bytez(bytez_api_key)
                logger.info("Bytez client initialized")
                print("Bytez client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Bytez: {e}")
                print(f"Failed to initialize Bytez: {e}")

        # Google Gemini Disabled
        self.gemini_model = None
    
    def generate_response(self, prompt, context=None):
        """
        Generate AI response using GPT-4o via Bytez or Gemini
        """
        try:
            # 1. Try Bytez
            if self.bytez_client:
                try:
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
                        # Return error directly, do not fallback
                        raise Exception(f"Bytez GPT-4o error: {result.error}")
                    
                    if hasattr(result, 'output'):
                        return result.output
                    return str(result)
                except Exception as e:
                    logger.warning(f"Bytez generation failed: {e}")
                    raise e # Re-raise to show the actual Bytez error

            # 2. Gemini Disabled
            if self.gemini_model:
                pass

            # 3. Mock Response
            else:
                logger.warning("No AI client initialized. Returning mock response.")
                return f"This is a simulated AI response to your question: '{prompt}'. Please configure BYTEZ_API_KEY."
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

# Global instance
ai_processor = AIProcessor()
print("AI Processor initialized successfully")