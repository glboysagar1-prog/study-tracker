#!/usr/bin/env python3
"""
Remove KhudkiBook materials specifically
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def remove_khudkibook_materials():
    """Remove all KhudkiBook materials"""
    print("🗑️  Removing KhudkiBook materials...")
    
    try:
        # Get all KhudkiBook material IDs
        result = supabase.table("notes").select("id").eq("source_name", "KhudkiBook").execute()
        khudki_ids = [item['id'] for item in result.data]
        
        if khudki_ids:
            print(f"  Found {len(khudki_ids)} KhudkiBook materials")
            
            # Delete in batches to avoid issues
            batch_size = 50
            total_removed = 0
            
            for i in range(0, len(khudki_ids), batch_size):
                batch = khudki_ids[i:i+batch_size]
                # Delete by ID
                for note_id in batch:
                    try:
                        supabase.table("notes").delete().eq("id", note_id).execute()
                        total_removed += 1
                    except Exception as e:
                        print(f"    Warning: Could not delete note ID {note_id}: {e}")
                
                print(f"    Processed batch {i//batch_size + 1} ({total_removed}/{len(khudki_ids)})")
            
            print(f"  ✓ Removed {total_removed} KhudkiBook materials")
        else:
            print("  ✓ No KhudkiBook materials found")
            
    except Exception as e:
        print(f"  ✗ Error removing KhudkiBook materials: {e}")

def verify_removal():
    """Verify that KhudkiBook materials were removed"""
    print("\n📊 Verification:")
    
    try:
        # Check remaining KhudkiBook materials
        result = supabase.table("notes").select("id", count="exact").eq("source_name", "KhudkiBook").execute()
        khudki_count = len(result.data)
        print(f"  - KhudkiBook materials: {khudki_count} records")
        
        # Check total notes
        result = supabase.table("notes").select("id", count="exact").execute()
        total_count = len(result.data)
        print(f"  - Total notes: {total_count} records")
        
        # Show some fresh materials
        print("\n📝 Sample fresh materials:")
        result = supabase.table("notes").select("*").neq("source_name", "KhudkiBook").limit(3).execute()
        for note in result.data:
            print(f"  • {note['title']}")
            print(f"    Subject: {note['subject_code']}")
            print(f"    Source: {note['source_name']}")
            print()
            
    except Exception as e:
        print(f"  ✗ Error during verification: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧹 Remove KhudkiBook Materials")
    print("=" * 60)
    
    try:
        remove_khudkibook_materials()
        verify_removal()
        
        print("\n" + "=" * 60)
        print("✅ KhudkiBook materials removal process completed!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")