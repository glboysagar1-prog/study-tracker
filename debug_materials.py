#!/usr/bin/env python3
"""
Debug script to examine materials in the database
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def debug_materials():
    """Debug materials in the database"""
    print("=" * 60)
    print("🔍 Debugging Materials")
    print("=" * 60)
    
    # Check all notes with source names
    print("\n📝 All Notes Sources:")
    try:
        result = supabase.table("notes").select("source_name", count="exact").execute()
        sources = {}
        for note in result.data:
            source = note.get('source_name', 'Unknown')
            sources[source] = sources.get(source, 0) + 1
        
        for source, count in sorted(sources.items()):
            print(f"  • {source}: {count} records")
            
    except Exception as e:
        print(f"  ✗ Error fetching notes: {e}")
    
    # Check specific KhudkiBook materials
    print("\n📚 KhudkiBook Materials:")
    try:
        result = supabase.table("notes").select("*").eq("source_name", "KhudkiBook").limit(5).execute()
        print(f"  Found {len(result.data)} KhudkiBook materials")
        for note in result.data:
            print(f"  • {note['title']}")
            print(f"    ID: {note['id']}")
            print(f"    Subject: {note['subject_code']}")
            print()
            
    except Exception as e:
        print(f"  ✗ Error fetching KhudkiBook materials: {e}")
    
    # Check fresh materials
    print("✨ Fresh Materials:")
    try:
        result = supabase.table("notes").select("*").neq("source_name", "KhudkiBook").limit(5).execute()
        print(f"  Found {len(result.data)} non-KhudkiBook materials")
        for note in result.data:
            print(f"  • {note['title']}")
            print(f"    Source: {note['source_name']}")
            print(f"    Subject: {note['subject_code']}")
            print()
            
    except Exception as e:
        print(f"  ✗ Error fetching fresh materials: {e}")

if __name__ == "__main__":
    debug_materials()