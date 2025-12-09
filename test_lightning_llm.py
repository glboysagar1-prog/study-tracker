
import os
import requests
import json

API_KEY = "1cc99e6d-43c5-4d71-97bb-8c4db388cd5d"
# Common OpenAI-compatible endpoints for hosted LLMs
BASE_URLS = [
    "https://api.lightning.ai/v1/chat/completions",
    "https://api.lightning.ai/v1/completions",
    "https://lightning.ai/api/v1/chat/completions"
]

print("Testing Lightning AI Text Generation...")

payload = {
    "model": "gpt-3.5-turbo", # Just trying a standard name, or maybe "llama3"
    "messages": [{"role": "user", "content": "Say hello!"}],
    "max_tokens": 10
}

for url in BASE_URLS:
    print(f"\nTrying URL: {url}")
    try:
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.post(url, json=payload, headers=headers, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
    except Exception as e:
        print(f"Error: {e}")

# If strictly using Open AI client
try:
    from openai import OpenAI
    print("\nTrying OpenAI Client with Lightning Base URL...")
    client = OpenAI(api_key=API_KEY, base_url="https://api.lightning.ai/v1")
    try:
        completion = client.chat.completions.create(
            model="tinyllama", # Guessing a model
            messages=[{"role": "user", "content": "Hello"}]
        )
        print("Success with OpenAI Client!")
        print(completion)
    except Exception as e:
        print(f"OpenAI Client Error: {e}")
except ImportError:
    print("\nOpenAI library not installed, skipping client test.")
