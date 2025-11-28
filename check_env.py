"""
Check what keys are available and try truncate approach
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("Checking environment variables...")
print(f"SUPABASE_URL: {'✓' if os.getenv('SUPABASE_URL') else '✗'}")
print(f"SUPABASE_KEY: {'✓' if os.getenv('SUPABASE_KEY') else '✗'}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {'✓' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else '✗'}")

# Show first few chars of each key
if os.getenv('SUPABASE_KEY'):
    key = os.getenv('SUPABASE_KEY')
    print(f"\nSUPABASE_KEY starts with: {key[:20]}...")

if os.getenv('SUPABASE_SERVICE_ROLE_KEY'):
    key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    print(f"SERVICE_ROLE_KEY starts with: {key[:20]}...")
