"""
Script to clear all notes from the database.
This prepares the database for fresh AI-generated study notes.
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def clear_all_notes():
    url = os.environ.get("SUPABASE_URL")
    # Try service role key first for RLS bypass
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return
    
    client = create_client(url, key)
    
    try:
        # First, count how many notes exist
        count_res = client.table("notes").select("id", count="exact").execute()
        total = count_res.count if hasattr(count_res, 'count') else len(count_res.data)
        
        print(f"📊 Found {total} notes in database")
        
        if total == 0:
            print("✅ Database already clean")
            return
        
        # Confirm deletion
        print(f"⚠️  This will delete ALL {total} notes from the database.")
        print("Press Enter to continue or Ctrl+C to cancel...")
        input()
        
        # Delete all notes
        print("🗑️  Deleting all notes...")
        
        # Delete in batches to avoid timeout
        batch_size = 100
        deleted = 0
        
        while True:
            # Get a batch of IDs
            batch_res = client.table("notes").select("id").limit(batch_size).execute()
            
            if not batch_res.data or len(batch_res.data) == 0:
                break
            
            ids = [row['id'] for row in batch_res.data]
            
            # Delete this batch
            for note_id in ids:
                try:
                    client.table("notes").delete().eq("id", note_id).execute()
                    deleted += 1
                    if deleted % 10 == 0:
                        print(f"  Deleted {deleted}/{total}...")
                except Exception as e:
                    print(f"  Error deleting note {note_id}: {e}")
        
        print(f"✅ Deleted {deleted} notes successfully")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    clear_all_notes()
