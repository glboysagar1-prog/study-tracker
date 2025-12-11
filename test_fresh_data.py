#!/usr/bin/env python3
"""
Test script to verify fresh data in the database
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def test_fresh_data():
    """Test that fresh data was added correctly"""
    print("=" * 60)
    print("🧪 Testing Fresh Data")
    print("=" * 60)
    
    # Test notes (check for our fresh materials)
    print("\n📝 Fresh Notes:")
    try:
        result = supabase.table("notes").select("*").neq("source_name", "KhudkiBook").order("created_at", desc=True).limit(10).execute()
        fresh_count = 0
        for note in result.data:
            # Check if it's one of our fresh materials
            if "GTUStudy" in note['source_name'] or "GTUMaterial" in note['source_name']:
                print(f"  • {note['title']}")
                print(f"    Subject: {note['subject_code']}")
                print(f"    Unit: {note['unit']}")
                print(f"    Source: {note['source_name']}")
                print()
                fresh_count += 1
                
        print(f"  ✅ Found {fresh_count} fresh notes")
    except Exception as e:
        print(f"  ✗ Error fetching notes: {e}")
    
    # Test important questions
    print("❓ Important Questions:")
    try:
        result = supabase.table("important_questions").select("*").order("created_at", desc=True).execute()
        for question in result.data:
            print(f"  • {question['question_text'][:60]}...")
            print(f"    Subject: {question['subject_code']}")
            print(f"    Unit: {question['unit']}")
            print(f"    Marks: {question['marks']}")
            print(f"    Source: {question['source_name']}")
            print()
        print(f"  ✅ Found {len(result.data)} important questions")
    except Exception as e:
        print(f"  ✗ Error fetching questions: {e}")
    
    # Test reference materials
    print("📚 Reference Materials:")
    try:
        result = supabase.table("reference_materials").select("*").order("created_at", desc=True).limit(5).execute()
        for ref in result.data:
            print(f"  • {ref['title']}")
            print(f"    Subject: {ref['subject_code']}")
            print(f"    Type: {ref['material_type']}")
            print(f"    Source: {ref['source_name']}")
            print()
        print(f"  ✅ Found {len(result.data)} reference materials")
    except Exception as e:
        print(f"  ✗ Error fetching references: {e}")
    
    # Test syllabus content
    print("📋 Syllabus Content:")
    try:
        result = supabase.table("syllabus_content").select("*").order("created_at", desc=True).limit(5).execute()
        for content in result.data:
            print(f"  • Unit {content['unit']}: {content['topic']}")
            print(f"    Subject: {content['subject_code']}")
            print(f"    Title: {content['unit_title']}")
            print(f"    Source: {content.get('source_name', 'N/A')}")
            print()
        print(f"  ✅ Found {len(result.data)} syllabus entries")
    except Exception as e:
        print(f"  ✗ Error fetching syllabus: {e}")
    
    # Check for KhudkiBook materials (should be filtered out by frontend)
    print("🚫 KhudkiBook Materials Check:")
    try:
        result = supabase.table("notes").select("id", count="exact").eq("source_name", "KhudkiBook").execute()
        khudki_count = len(result.data)
        print(f"  • KhudkiBook materials in database: {khudki_count}")
        print(f"  • Note: Frontend filters these out automatically")
    except Exception as e:
        print(f"  ✗ Error checking KhudkiBook materials: {e}")

if __name__ == "__main__":
    test_fresh_data()