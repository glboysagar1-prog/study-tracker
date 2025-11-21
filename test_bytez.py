"""
Test Bytez API to understand return format
"""
from bytez import Bytez
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("BYTEZ_API_KEY")
sdk = Bytez(key)

# Test with URL example from user
print("Testing with URL...")
model = sdk.model("openai/whisper-large-v3")
result = model.run("https://huggingface.co/datasets/huggingfacejs/tasks/resolve/main/audio-classification/audio.wav")

print(f"Type of result: {type(result)}")
print(f"Result: {result}")

# Try unpacking
if isinstance(result, tuple):
    print(f"Result is tuple with {len(result)} elements")
    output, error = result
    print(f"Output: {output}")
    print(f"Error: {error}")
else:
    print("Result is not a tuple")
