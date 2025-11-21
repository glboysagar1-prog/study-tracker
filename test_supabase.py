"""
Test script to verify Supabase connection
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def test_supabase_connection():
    # Get Supabase credentials from environment
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        return
    
    try:
        # Create Supabase client
        supabase: Client = create_client(url, key)
        print("Supabase client created successfully!")
        
        # Test connection by trying to fetch users table (will be empty but should not error)
        response = supabase.table("users").select("*").limit(1).execute()
        print("Connection test successful!")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"Error connecting to Supabase: {str(e)}")

if __name__ == "__main__":
    test_supabase_connection()