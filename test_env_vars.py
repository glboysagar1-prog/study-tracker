import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_env_vars():
    print("Testing environment variables...")
    
    # Check if required environment variables are set
    supabase_url = os.environ.get('SUPABASE_URL')
    supabase_key = os.environ.get('SUPABASE_KEY')
    bytez_api_key = os.environ.get('BYTEZ_API_KEY')
    
    print(f"SUPABASE_URL: {'✓ Set' if supabase_url else '✗ Not set'}")
    print(f"SUPABASE_KEY: {'✓ Set' if supabase_key else '✗ Not set'}")
    print(f"BYTEZ_API_KEY: {'✓ Set' if bytez_api_key else '✗ Not set'}")
    
    if bytez_api_key:
        print(f"BYTEZ_API_KEY length: {len(bytez_api_key)} characters")
        # Show first and last few characters for verification (but not the full key)
        if len(bytez_api_key) > 10:
            print(f"BYTEZ_API_KEY (partial): {bytez_api_key[:5]}...{bytez_api_key[-5:]}")

if __name__ == "__main__":
    test_env_vars()