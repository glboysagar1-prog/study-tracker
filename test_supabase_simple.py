import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.supabase_client import supabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_supabase_simple():
    print("Testing Supabase integration (simple test)...")
    
    try:
        # Test connection by trying to fetch users table (will be empty but should not error)
        response = supabase.table("users").select("*").limit(1).execute()
        print("✓ Supabase connection successful")
        print(f"Response: {response}")
        
        # Test fetching subjects table
        response = supabase.table("subjects").select("*").limit(1).execute()
        print("✓ Subjects table access successful")
        print(f"Response: {response}")
        
        # Test fetching syllabus table
        response = supabase.table("syllabus").select("*").limit(1).execute()
        print("✓ Syllabus table access successful")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"✗ Error with Supabase integration: {e}")

if __name__ == "__main__":
    test_supabase_simple()