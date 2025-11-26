import os
import sys
from dotenv import load_dotenv

load_dotenv()

print(f"Python version: {sys.version}")

try:
    import bytez
    print(f"Bytez package found. Version: {getattr(bytez, '__version__', 'unknown')}")
except ImportError as e:
    print(f"Bytez package NOT found: {e}")
    sys.exit(1)

key = os.environ.get('BYTEZ_API_KEY')
if key:
    print("BYTEZ_API_KEY is set.")
    print(f"Key length: {len(key)}")
    try:
        from bytez import Bytez
        client = Bytez(key)
        print("Bytez client initialized successfully.")
    except Exception as e:
        print(f"Failed to initialize Bytez client: {e}")
else:
    print("BYTEZ_API_KEY is NOT set.")
