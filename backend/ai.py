import os
import logging
import requests
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
        self.groq_api_key = os.environ.get('GROQ_API_KEY')
        
        # Initialize Bytez client if API key is available
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        
        if bytez_api_key and BYTEZ_AVAILABLE:
            try:
                self.bytez_client = Bytez(bytez_api_key)
                logger.info("Bytez client initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Bytez: {e}")
        
        if self.groq_api_key:
            logger.info("Groq API key found (fallback enabled)")
    
    def _call_groq(self, messages):
        """Call Groq API (super fast, reliable fallback)"""
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "max_tokens": 1000,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("choices", [{}])[0].get("message", {}).get("content", "")
            else:
                logger.warning(f"Groq API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            return None
    
    def generate_response(self, prompt, context="", model_type="gemini", image_parts=None):
        """
        Generate a response using the available AI model.
        Tries Bytez first, then Groq as fallback.
        """
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": prompt})
        
        try:
            # 1. Bytez Generation (Primary)
            if self.bytez_client:
                try:
                    response = self.bytez_client.model("openai/gpt-4o").run(messages)
                    
                    print(f"DEBUG: Bytez raw response: {response}", flush=True)
                    
                    final_response = ""
                    if hasattr(response, 'output'):
                        raw_output = response.output
                        if isinstance(raw_output, dict):
                            final_response = raw_output.get('content', '')
                        else:
                            final_response = raw_output
                    elif isinstance(response, str):
                        final_response = response
                    
                    # Check for error in response
                    if hasattr(response, 'error') and response.error:
                        print(f"DEBUG: Bytez returned error: {response.error}", flush=True)
                        final_response = ""  # Force fallback
                    
                    if final_response:
                        return final_response
                    else:
                        print("DEBUG: Bytez returned empty, trying Groq fallback...", flush=True)
                        
                except Exception as e:
                    logger.error(f"Bytez generation failed: {e}")
            
            # 2. Groq Fallback (if Bytez failed or returned empty)
            if self.groq_api_key:
                print("DEBUG: Trying Groq API fallback...", flush=True)
                groq_response = self._call_groq(messages)
                if groq_response:
                    print(f"DEBUG: Groq success: {groq_response[:100]}...", flush=True)
                    return groq_response

            # 3. Mock Response (last resort)
            logger.warning("All AI providers failed. Returning error message.")
            return "I'm sorry, the AI service is currently experiencing issues. Please try again in a moment."
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}", exc_info=True)
            return f"I encountered an error while processing your request: {str(e)}. Please try again later."

    def stream_response(self, prompt, context=""):
        """
        Stream response using Groq (OpenAI-compatible) for Vercel AI SDK.
        """
        messages = []
        if context:
            messages.append({"role": "system", "content": context})
        messages.append({"role": "user", "content": prompt})

        try:
            # Using Groq for streaming as it's reliable and supports OpenAI-style streaming
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "max_tokens": 1000,
                    "temperature": 0.7,
                    "stream": True # Enable streaming
                },
                stream=True,
                timeout=30
            )

            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        decoded_line = line.decode('utf-8')
                        if decoded_line.startswith('data: '):
                            data = decoded_line[6:]
                            if data == '[DONE]':
                                break
                            yield f"data: {data}\n\n"
            else:
                yield f"data: {{\"error\": \"Groq API error: {response.status_code}\"}}\n\n"
        except Exception as e:
            yield f"data: {{\"error\": \"{str(e)}\"}}\n\n"

# Global instance
ai_processor = AIProcessor()