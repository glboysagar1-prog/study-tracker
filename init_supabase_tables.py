"""
Script to initialize Supabase tables for the GTU Exam Preparation Application
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def init_supabase_tables():
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
        
        # Create users table
        print("Creating users table...")
        # Note: In Supabase, tables are created via the dashboard or SQL editor
        # This is just to verify connectivity
        try:
            response = supabase.table("users").select("*").limit(1).execute()
            print("Users table accessible!")
        except Exception as e:
            print(f"Users table may not exist yet: {str(e)}")
        
        print("\nNext steps:")
        print("1. Go to your Supabase dashboard at https://phhrwkcqmuktajuuswza.supabase.co")
        print("2. Navigate to Table Editor")
        print("3. Create the required tables using the schemas in backend/supabase_init.py")
        print("4. Set up Row Level Security (RLS) policies as needed")
        
    except Exception as e:
        print(f"Error connecting to Supabase: {str(e)}")

if __name__ == "__main__":
    init_supabase_tables()