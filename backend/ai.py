import os
import logging
from dotenv import load_dotenv

# Try to import bytez (robust import)
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
    logging.info("✓ Bytez imported from root")
except ImportError:
    try:
        # Fallback for some versions/structures
        from bytez.main import Bytez
        BYTEZ_AVAILABLE = True
        logging.info("✓ Bytez imported from bytez.main")
    except ImportError as e:
        BYTEZ_AVAILABLE = False
        Bytez = None
        logging.error(f"✗ Bytez import failed: {e}")

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
                    
                    # Debug: Log raw response using print for visibility
                    print(f"DEBUG: Bytez raw response type: {type(response)}", flush=True)
                    print(f"DEBUG: Bytez raw response content: {response}", flush=True)
                    print(f"DEBUG: Bytez raw response dir: {dir(response)}", flush=True)
                    
                    final_response = ""
                    # Handle Bytez response structure
                    if hasattr(response, 'output'):
                        final_response = response.output
                    elif isinstance(response, str):
                        final_response = response
                    else:
                        final_response = str(response)
                    
                    if not final_response:
                        print("DEBUG: Final response text is empty!", flush=True)
                        return "Error: The AI operation completed but returned no text. This might be a model availability issue."
                        
                    return final_response
                        
                except Exception as e:
                    logger.error(f"Bytez generation failed: {e}")
                    # Fallback to mock if Bytez fails
            
            # 2. Google Gemini (Disabled)
            # if self.gemini_model: ...

            # 3. Mock Response
            bytez_api_key = os.environ.get('BYTEZ_API_KEY') # Re-fetch or pass as arg if needed, for logging context
            logger.warning(f"No AI client initialized. Returning mock response. Key={bool(bytez_api_key)}, Lib={BYTEZ_AVAILABLE}")
            debug_info = f"[Debug: Key={bool(bytez_api_key)}, Lib={BYTEZ_AVAILABLE}]"
            return f"This is a simulated AI response to your question: '{prompt}'. Please configure BYTEZ_API_KEY. {debug_info}"
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

# Global instance
ai_processor = AIProcessor()