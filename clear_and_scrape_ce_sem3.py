#!/usr/bin/env python3
"""
Script to clear existing notes for Computer Engineering Semester 3
and run the Crawlee scraper to fetch fresh data.
"""

import os
import subprocess
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# CE Sem 3 Subject Codes (GTU 2024 scheme)
CE_SEM3_SUBJECTS = [
    {"code": "3130702", "name": "Data Structures"},
    {"code": "3130703", "name": "Database Management Systems"},
    {"code": "3130704", "name": "Digital Logic Design"},
    {"code": "3130006", "name": "Probability and Statistics"},
    {"code": "3130705", "name": "Object Oriented Programming"},
]

def clear_existing_data():
    """Remove all existing notes and content for CE Sem 3 subjects"""
    print("\n🗑️  Clearing existing data for CE Semester 3 subjects...")
    
    subject_codes = [s["code"] for s in CE_SEM3_SUBJECTS]
    
    # Clear from notes table
    print("  → Clearing notes table...")
    for code in subject_codes:
        result = supabase.table("notes").delete().eq("subject_code", code).execute()
        print(f"    Deleted notes for {code}")
    
    # Clear from syllabus_content table
    print("  → Clearing syllabus_content table...")
    for code in subject_codes:
        result = supabase.table("syllabus_content").delete().eq("subject_code", code).execute()
        print(f"    Deleted syllabus content for {code}")
    
    # Clear from question_banks table
    print("  → Clearing question_banks table...")
    for code in subject_codes:
        result = supabase.table("question_banks").delete().eq("subject_code", code).execute()
        print(f"    Deleted questions for {code}")
    
    print("✅ Cleared all existing data for CE Sem 3 subjects!\n")

def ensure_subjects_exist():
    """Make sure CE Sem 3 subjects exist in the database"""
    print("📋 Ensuring CE Sem 3 subjects exist in database...")
    
    for subject in CE_SEM3_SUBJECTS:
        # Check if subject exists
        existing = supabase.table("subjects").select("id").eq("subject_code", subject["code"]).execute()
        
        if not existing.data:
            # Insert subject
            supabase.table("subjects").insert({
                "subject_code": subject["code"],
                "subject_name": subject["name"],
                "course": "B.E.",
                "branch": "Computer Engineering",
                "semester": "3",
                "credits": 4
            }).execute()
            print(f"  ✓ Added subject: {subject['name']} ({subject['code']})")
        else:
            print(f"  → Subject exists: {subject['name']} ({subject['code']})")
    
    print("✅ All subjects verified!\n")

def verify_data():
    """Verify the subjects in database"""
    print("\n📊 Current CE Sem 3 subjects in database:")
    
    result = supabase.table("subjects").select("*").eq("branch", "Computer Engineering").eq("semester", "3").execute()
    
    for subj in result.data:
        print(f"  - {subj['subject_name']} ({subj['subject_code']})")
    
    return result.data

if __name__ == "__main__":
    print("=" * 60)
    print("🎓 GTU CE Semester 3 - Fresh Data Scraper Setup")
    print("=" * 60)
    
    # Step 1: Ensure subjects exist
    ensure_subjects_exist()
    
    # Step 2: Clear existing data
    clear_existing_data()
    
    # Step 3: Verify
    subjects = verify_data()
    
    print("\n" + "=" * 60)
    print("✅ Database prepared! Now run the Crawlee scraper:")
    print("   cd scraper/crawlee-scraper && npm start")
    print("=" * 60)
