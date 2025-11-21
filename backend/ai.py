import os
import logging
from dotenv import load_dotenv

# Try to import bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False
    logging.warning("Bytez library not available. Using basic AI features only.")

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class AIProcessor:
    def __init__(self):
        self.bytez_client = None
        
        # Initialize Bytez client if API key is available
        bytez_api_key = os.environ.get('BYTEZ_API_KEY')
        if bytez_api_key and BYTEZ_AVAILABLE:
            self.bytez_client = Bytez(bytez_api_key)
    
    def generate_response(self, prompt, context=None):
        """
        Generate AI response using GPT-4o via Bytez
        """
        try:
            if not self.bytez_client:
                # Return a mock response when Bytez client is not available
                return f"This is a simulated AI response to your question: '{prompt}'. In a production environment, this would be answered by GPT-4o via Bytez."
            
            # Choose gpt-4o model
            model = self.bytez_client.model("openai/gpt-4o")
            
            # Prepare messages
            messages = []
            
            # Add context if provided
            if context:
                messages.append({
                    "role": "system",
                    "content": context
                })
            
            # Add user prompt
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            # Generate response
            result = model.run(messages)
            
            # Handle different return types
            # Bytez might return a tuple (output, error) or just output
            if isinstance(result, tuple) and len(result) >= 2:
                output, error = result[0], result[1]
                if error:
                    raise Exception(f"Bytez GPT-4o error: {error}")
            else:
                output = result
            
            # Extract response text from output
            if isinstance(output, dict) and 'choices' in output and len(output['choices']) > 0:
                return output['choices'][0]['message']['content']
            elif isinstance(output, dict) and 'text' in output:
                return output['text']
            else:
                return str(output)
        except Exception as e:
            # Return a mock response when there's an error
            return f"This is a simulated AI response to your question: '{prompt}'. In a production environment with a valid Bytez API key, this would be answered by GPT-4o."

# Global instance
ai_processor = AIProcessor()