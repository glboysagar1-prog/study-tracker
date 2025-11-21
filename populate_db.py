"""
Quick script to populate GTU database with sample data
"""
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Sample subjects data
subjects_data = [
    {
        'course': 'B.E.',
        'branch': 'Computer Engineering',
        'semester': '3',
        'subject_code': '2140701',
        'subject_name': 'Data Structures',
        'credits': 5
    },
    {
        'course': 'B.E.',
        'branch': 'Computer Engineering',
        'semester': '3',
        'subject_code': '2140702',
        'subject_name': 'Database Management Systems',
        'credits': 5
    },
    {
        'course': 'B.E.',
        'branch': 'Computer Engineering',
        'semester': '4',
        'subject_code': '2140705',
        'subject_name': 'Operating Systems',
        'credits': 5
    }
]

print("Populating database with sample data...")

# Insert subjects
for subj in subjects_data:
    try:
        result = supabase.table("subjects").insert(subj).execute()
        print(f"✓ Added subject: {subj['subject_name']}")
    except Exception as e:
        print(f"✗ Error adding {subj['subject_name']}: {str(e)}")

print("\nDone! Check http://localhost:5004/api/subjects")
