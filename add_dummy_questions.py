import os
import random
from dotenv import load_dotenv
from backend.supabase_client import supabase

load_dotenv()

def add_dummy_questions():
    print("Adding dummy questions...")
    
    # Get a subject
    subjects = supabase.table("subjects").select("id").limit(1).execute().data
    if not subjects:
        print("No subjects found.")
        return
    subject_id = subjects[0]['id']
    
    # Add 10 questions of each mark type
    for marks in [1, 3, 4, 7]:
        for i in range(10):
            data = {
                "subject_id": subject_id,
                "unit_number": random.randint(1, 5),
                "question_text": f"Dummy Question {i} for {marks} marks (Test Data)",
                "marks": marks,
                "question_type": "Long" if marks > 1 else "Short",
                "gtu_section": "Q1" if marks == 1 else f"Q{random.randint(2,5)}",
                "is_important": random.choice([True, False]),
                "frequency_count": random.randint(0, 10)
            }
            try:
                supabase.table("questions").insert(data).execute()
            except Exception as e:
                print(f"Error: {e}")
                
    print("Done adding dummy questions.")

if __name__ == "__main__":
    add_dummy_questions()
