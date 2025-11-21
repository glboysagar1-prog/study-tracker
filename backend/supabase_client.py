import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
def get_supabase_client():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        raise Exception("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
    
    return create_client(url, key)

# Global Supabase client instance
supabase: Client = get_supabase_client()