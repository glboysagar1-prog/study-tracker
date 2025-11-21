"""
Quick script to add sample subjects to database for testing SubjectBrowser
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY required")
    exit(1)

supabase = create_client(url, key)

print("Adding sample subjects...")
print("="*60)

# Sample subjects across different branches and semesters
subjects = [
    # Computer Engineering
    {
        "course": "B.E.",
        "branch": "Computer Engineering",
        "semester": "3",
        "subject_code": "3140703",
        "subject_name": "Database Management Systems",
        "credits": 5
    },
    {
        "course": "B.E.",
        "branch": "Computer Engineering",
        "semester": "5",
        "subject_code": "3150703",
        "subject_name": "Web Technology",
        "credits": 5
    },
    {
        "course": "B.E.",
        "branch": "Computer Engineering",
        "semester": "5",
        "subject_code": "3150704",
        "subject_name": "Artificial Intelligence",
        "credits": 4
    },
    # Information Technology
    {
        "course": "B.E.",
        "branch": "Information Technology",
        "semester": "4",
        "subject_code": "3140705",
        "subject_name": "Operating Systems",
        "credits": 5
    },
    {
        "course": "B.E.",
        "branch": "Information Technology",
        "semester": "5",
        "subject_code": "3150710",
        "subject_name": "Computer Networks",
        "credits": 5
    },
    # Electronics & Communication
    {
        "course": "B.E.",
        "branch": "Electronics and Communication",
        "semester": "4",
        "subject_code": "2140303",
        "subject_name": "Digital Communication",
        "credits": 5
    },
]

success_count = 0
skip_count = 0

for subject in subjects:
    try:
        # Check if already exists
        existing = supabase.table("subjects").select("*").eq("subject_code", subject["subject_code"]).execute()
        
        if existing.data and len(existing.data) > 0:
            print(f"  ⚠️  Skipped (exists): {subject['subject_name']} ({subject['subject_code']})")
            skip_count += 1
        else:
            result = supabase.table("subjects").insert(subject).execute()
            if result.data:
                print(f"  ✓ Added: {subject['subject_name']} ({subject['subject_code']})")
                success_count += 1
    except Exception as e:
        print(f"  ❌ Error: {subject['subject_name']} - {str(e)}")

print("\n" + "="*60)
print(f"Summary: {success_count} added, {skip_count} skipped")

# Verify total subjects
total = supabase.table("subjects").select("id").execute()
print(f"Total subjects in database: {len(total.data)}")
print("="*60)
