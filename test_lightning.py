import os
from openai import OpenAI

# Test Lightning AI connection
try:
    client = OpenAI(
        api_key="1cc99e6d-43c5-4d71-97bb-8c4db388cd5d",
        base_url="https://lightning.ai/api/v1"
    )
    
    # Try a simple completion
    completion = client.completions.create(
        model="gpt-3.5-turbo",
        prompt="Hello, world!",
        max_tokens=5
    )
    
    print("Lightning AI connection successful!")
    print(f"Response: {completion}")
    
except Exception as e:
    print(f"Lightning AI connection failed: {e}")