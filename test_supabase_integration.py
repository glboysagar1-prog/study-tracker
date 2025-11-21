import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.supabase_client import supabase

def test_supabase_integration():
    print("Testing Supabase integration...")
    
    try:
        # Test connection by trying to fetch users table (will be empty but should not error)
        response = supabase.table("users").select("*").limit(1).execute()
        print("✓ Supabase connection successful")
        print(f"Response: {response}")
        
        # Test inserting a sample subject instead of user to avoid schema issues
        subject_data = {
            "course": "B.E.",
            "branch": "Computer Engineering",
            "semester": "3",
            "subject_code": "TEST101",
            "subject_name": "Test Subject",
            "credits": 4
        }
        
        insert_response = supabase.table("subjects").insert(subject_data).execute()
        print("✓ Sample subject insertion successful")
        if insert_response.data and len(insert_response.data) > 0:
            subject_id = insert_response.data[0].get('id') if isinstance(insert_response.data[0], dict) else 'N/A'
            print(f"Inserted subject ID: {subject_id}")
        else:
            print("Inserted subject ID: N/A")
        
        # Test fetching the inserted subject
        fetch_response = supabase.table("subjects").select("*").eq("subject_code", "TEST101").execute()
        print("✓ Subject fetch successful")
        print(f"Found {len(fetch_response.data)} subject(s) with code TEST101")
        
        # Clean up - delete the test subject
        if fetch_response.data and len(fetch_response.data) > 0:
            subject_id = fetch_response.data[0].get('id') if isinstance(fetch_response.data[0], dict) else None
            if subject_id:
                supabase.table("subjects").delete().eq("id", subject_id).execute()
                print("✓ Test subject cleaned up successfully")
        
    except Exception as e:
        print(f"✗ Error with Supabase integration: {e}")

if __name__ == "__main__":
    test_supabase_integration()