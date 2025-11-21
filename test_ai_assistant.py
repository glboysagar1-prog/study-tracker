import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.ai import AIProcessor

def test_ai_assistant():
    print("Testing AI Assistant with Bytez API key...")
    
    # Initialize AI processor
    ai_processor = AIProcessor()
    
    # Check if Bytez client is initialized
    if ai_processor.bytez_client:
        print("✓ Bytez client initialized successfully")
        
        # Test generating a response
        try:
            prompt = "Explain what a data structure is in computer science."
            context = "You are an AI tutor helping GTU students prepare for their exams. Provide clear, concise, and accurate explanations."
            
            response = ai_processor.generate_response(prompt, context)
            print("✓ AI response generated successfully")
            print(f"Response: {response}")
            
        except Exception as e:
            print(f"✗ Error generating AI response: {e}")
    else:
        print("✗ Bytez client not initialized")
        print("This might be because the BYTEZ_API_KEY is not set correctly in the environment")

if __name__ == "__main__":
    test_ai_assistant()