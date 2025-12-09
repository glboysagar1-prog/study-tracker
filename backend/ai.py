import os
import logging
from dotenv import load_dotenv

# Try to import bytez with verbose debugging
try:
    import bytez
    try:
        from bytez import Bytez
        BYTEZ_AVAILABLE = True
        logging.info(f"✓ Bytez library imported successfully. Version: {getattr(bytez, '__version__', 'unknown')}")
# Try to import bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False
    Bytez = None
    # Switched to info to avoid startling user
    # logging.info("Bytez library not found (optional)")

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

# Google Gemini removed as per user request
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
        self.lightning_client = None
        
        # 0. Initialize Lightning AI (Primary)
        lightning_key = os.environ.get('LIGHTNING_API_KEY')
        if lightning_key and OPENAI_AVAILABLE:
            try:
                self.lightning_client = OpenAI(
                    api_key=lightning_key,
                    base_url="https://lightning.ai/api/v1"
                )
                logger.info("Lightning AI initialized in AIProcessor")
            except Exception as e:
                logger.warning(f"Failed to initialize Lightning AI: {e}")

        # 1. Initialize Bytez client (Secondary)
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        if bytez_api_key and BYTEZ_AVAILABLE:
            try:
                self.bytez_client = Bytez(bytez_api_key)
                logger.info("Bytez client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Bytez: {e}")

        # Google Gemini Disabled
        self.gemini_model = None
    
    def generate_response(self, prompt, context=None):
        """
        Generate AI response using Lightning AI or Bytez
        """
        try:
            # 0. Try Lightning AI
            if self.lightning_client:
                try:
                    logger.info(f"Using Lightning AI for prompt: {prompt[:50]}...")
                    messages = []
                    if context:
                        messages.append({"role": "system", "content": context})
                    messages.append({"role": "user", "content": prompt})
                    
                    response = self.lightning_client.chat.completions.create(
                        model="gpt-4o",
                        messages=messages
                    )
                    content = response.choices[0].message.content
                    return content
                except Exception as e:
                    logger.warning(f"Lightning AI generation failed: {e}")
                    if "402" in str(e) or "insufficient_balance" in str(e):
                        return f"Lightning AI Error: Insufficient Credits. Please top up your account."

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
                return f"AI Service Unavailable: Please configure LIGHTNING_API_KEY or BYTEZ_API_KEY."
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

# Global instance
ai_processor = AIProcessor()