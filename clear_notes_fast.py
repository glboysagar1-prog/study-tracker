"""
Improved script to clear all notes from the database using a more efficient approach.
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def clear_all_notes_efficient():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    client = create_client(url, key)
    
    try:
        # Simple approach: use a delete without condition to clear all
        # This should be much faster than deleting one by one
        print("🗑️  Clearing all notes from database...")
        
        # Get initial count
        count_res = client.table("notes").select("id", count="exact").execute()
        total = count_res.count if hasattr(count_res, 'count') else len(count_res.data)
        print(f"📊 Found {total} notes to delete")
        
        if total == 0:
            print("✅ Database already clean")
            return
        
        # Try bulk delete approach with RPC or direct SQL if available
        # Since we can't use RPC easily, let's delete all at once
        print("⚠️  Attempting bulk delete...")
        
        # Delete without a filter deletes all rows
        result = client.table("notes").delete().neq("id", 0).execute()
        
        print(f"✅ Deletion completed")
        
        # Verify
        verify_res = client.table("notes").select("id", count="exact").execute()
        remaining = verify_res.count if hasattr(verify_res, 'count') else len(verify_res.data)
        print(f"📊 Remaining notes: {remaining}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    clear_all_notes_efficient()
