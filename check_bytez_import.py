#!/usr/bin/env python3
"""Test script to check if Bytez can be imported"""

print("Testing Bytez import...")

try:
    from bytez import Bytez
    print("✓ Bytez imported successfully")
    print(f"Bytez class: {Bytez}")
    
    # Try to create an instance (this will fail without API key, but that's ok)
    try:
        client = Bytez("test-key")
        print("✓ Bytez client created successfully")
    except Exception as e:
        print(f"ℹ️ Bytez client creation failed (expected without valid key): {e}")
        
except ImportError as e:
    print(f"✗ Bytez import failed: {e}")
    print("This means the bytez package is not installed or not accessible")
    
except Exception as e:
    print(f"✗ Unexpected error: {e}")

print("\nTesting other imports...")

# Test other imports
try:
    import fastapi
    print("✓ FastAPI imported successfully")
except Exception as e:
    print(f"✗ FastAPI import failed: {e}")

try:
    import uvicorn
    print("✓ Uvicorn imported successfully")
except Exception as e:
    print(f"✗ Uvicorn import failed: {e}")

print("\nDone.")