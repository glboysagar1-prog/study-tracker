#!/usr/bin/env python3
"""
Clear all existing study notes from database using batch delete.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def clear_all_notes():
    """Remove ALL notes from the database"""
    print("🗑️  Clearing ALL study notes from database...")
    
    # Get all note IDs first
    try:
        result = supabase.table("notes").select("id").execute()
        note_ids = [row["id"] for row in result.data]
        print(f"  Found {len(note_ids)} notes to delete")
        
        if note_ids:
            # Delete in batches
            batch_size = 50
            total_deleted = 0
            for i in range(0, len(note_ids), batch_size):
                batch = note_ids[i:i+batch_size]
                supabase.table("notes").delete().in_("id", batch).execute()
                total_deleted += len(batch)
                print(f"  Deleted batch {i//batch_size + 1} ({total_deleted}/{len(note_ids)})")
            
            print(f"  ✓ Cleared {total_deleted} notes")
        else:
            print("  ✓ No notes to delete")
    except Exception as e:
        print(f"  ✗ Error clearing notes: {e}")

def verify_cleared():
    """Verify tables are empty"""
    print("\n📊 Verification:")
    
    try:
        result = supabase.table("notes").select("id", count="exact").execute()
        print(f"  - notes table: {len(result.data)} records")
    except:
        print("  - notes table: error")

if __name__ == "__main__":
    print("=" * 60)
    print("🧹 Clearing All Study Notes")
    print("=" * 60)
    
    clear_all_notes()
    verify_cleared()
    
    print("\n" + "=" * 60)
    print("Ready for fresh Crawlee scraping!")
    print("=" * 60)
