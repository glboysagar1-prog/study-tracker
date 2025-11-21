"""
Add sample material data for Data Structures (2140701)
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

print("Adding sample material data for Data Structures...")
print("="*60)

SUBJECT_CODE = "2140701"
SUBJECT_NAME = "Data Structures"

# Sample Notes
notes_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 1,
        "title": "Introduction to Data Structures",
        "description": "Basics of algorithms, time complexity, and space complexity",
        "file_url": "https://www.gtustudy.com/materials/ds-unit1.pdf",
        "source_url": "https://www.gtustudy.com/ds/unit1",
        "source_name": "GTUStudy",
        "content_hash": "ds_note_001"
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "title": "Linear Data Structures: Arrays and Stacks",
        "description": "Array operations, Stack implementation and applications",
        "file_url": "https://www.gtustudy.com/materials/ds-unit2.pdf",
        "source_url": "https://www.gtustudy.com/ds/unit2",
        "source_name": "GTUStudy",
        "content_hash": "ds_note_002"
    }
]

# Sample Questions
questions_data = [
    {
        "subject_code": SUBJECT_CODE,
        "unit": 1,
        "question_text": "Define Data Structure. Explain linear and non-linear data structures with examples.",
        "marks": 7,
        "difficulty": "easy",
        "frequency": 8,
        "last_asked_year": 2024,
        "answer_text": "Data structure is a way of organizing data... Linear: Array, Stack, Queue. Non-linear: Tree, Graph.",
        "source_url": "https://www.gtustudy.com/ds/questions",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 3,
        "question_text": "Write an algorithm to insert an element into a circular queue.",
        "marks": 7,
        "difficulty": "medium",
        "frequency": 6,
        "last_asked_year": 2023,
        "source_url": "https://www.gtumaterial.com/ds/queue",
        "source_name": "GTUMaterial"
    }
]

# Sample References
references_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "book",
        "title": "Data Structures using C",
        "author": "Reema Thareja",
        "description": "Excellent book for beginners",
        "url": "https://www.amazon.in/Data-Structures-Using-Reema-Thareja/dp/0198099304",
        "source_url": "https://www.gtustudy.com/references",
        "source_name": "GTUStudy",
        "publisher": "Oxford University Press",
        "year": 2014
    }
]

try:
    # Insert notes
    print("\nInserting notes...")
    for note in notes_data:
        try:
            supabase.table("notes").insert(note).execute()
            print(f"  ✓ Added note: {note['title']}")
        except Exception as e:
            print(f"  ⚠ Skipped note: {e}")

    # Insert questions
    print("\nInserting questions...")
    for question in questions_data:
        try:
            supabase.table("important_questions").insert(question).execute()
            print(f"  ✓ Added question")
        except Exception as e:
            print(f"  ⚠ Skipped question: {e}")

    # Insert references
    print("\nInserting references...")
    for ref in references_data:
        try:
            supabase.table("reference_materials").insert(ref).execute()
            print(f"  ✓ Added reference: {ref['title']}")
        except Exception as e:
            print(f"  ⚠ Skipped reference: {e}")

    print("\n✅ Data Structures sample data added!")

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
