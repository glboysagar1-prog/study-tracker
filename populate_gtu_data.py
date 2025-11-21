"""
Populate GTU-specific data:
1. Mark existing questions as important
2. Create new questions with GTU mark patterns (1, 3, 4, 7)
3. Create a GTU-style mock test
"""
import os
import random
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

print("=" * 60)
print("GTU FEATURE DATA POPULATION")
print("=" * 60)

# Get subjects
subjects = supabase.table("subjects").select("*").execute().data
if not subjects:
    print("No subjects found. Run populate_db.py first.")
    exit()

subject = subjects[0] # Use first subject (Data Structures)
subject_id = subject['id']
print(f"Processing subject: {subject['subject_name']}")

# 1. Update existing questions to be important
print("\nUpdating existing questions...")
questions = supabase.table("questions").select("*").eq("subject_id", subject_id).execute().data

for i, q in enumerate(questions):
    # Mark every 3rd question as important
    is_imp = (i % 3 == 0)
    freq = random.randint(3, 10) if is_imp else random.randint(0, 2)
    
    supabase.table("questions").update({
        "is_important": is_imp,
        "frequency_count": freq,
        "difficulty_level": random.choice(["Easy", "Medium", "Hard"])
    }).eq("id", q['id']).execute()

print(f"✓ Updated {len(questions)} questions with importance flags")

# 2. Create GTU Pattern Questions (1, 3, 4, 7 marks)
print("\nCreating GTU pattern questions...")

gtu_questions = [
    # 1 Mark Questions (Short)
    {"text": "Define Stack.", "marks": 1, "section": "Q1"},
    {"text": "What is Time Complexity?", "marks": 1, "section": "Q1"},
    {"text": "Define Linked List.", "marks": 1, "section": "Q1"},
    {"text": "What is a Binary Tree?", "marks": 1, "section": "Q1"},
    {"text": "Define Hashing.", "marks": 1, "section": "Q1"},
    
    # 3 Mark Questions
    {"text": "Explain Stack operations with algorithm.", "marks": 3, "section": "Q2"},
    {"text": "Differentiate between Array and Linked List.", "marks": 3, "section": "Q2"},
    
    # 4 Mark Questions
    {"text": "Explain Quick Sort algorithm with example.", "marks": 4, "section": "Q2"},
    {"text": "Write a program to implement Binary Search.", "marks": 4, "section": "Q3"},
    
    # 7 Mark Questions
    {"text": "Explain AVL Tree with rotation examples.", "marks": 7, "section": "Q3"},
    {"text": "Implement Circular Queue using Array.", "marks": 7, "section": "Q4"},
    {"text": "Explain Dijkstra's Algorithm for Shortest Path.", "marks": 7, "section": "Q5"}
]

for q in gtu_questions:
    data = {
        "subject_id": subject_id,
        "unit_number": random.randint(1, 4),
        "question_text": q["text"],
        "marks": q["marks"],
        "question_type": "Long" if q["marks"] > 2 else "Short",
        "gtu_section": q["section"],
        "is_important": True,
        "frequency_count": random.randint(5, 15),
        "ai_explanation": f"Standard GTU explanation for {q['text']}"
    }
    try:
        supabase.table("questions").insert(data).execute()
        print(f"  ✓ Added {q['marks']}-mark question: {q['text']}")
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")

# 3. Create GTU Mock Test
print("\nCreating GTU-style Mock Test...")
test_data = {
    "subject_id": subject_id,
    "title": "GTU Winter 2024 - Model Paper",
    "duration_minutes": 150, # 2.5 Hours
    "max_score": 70
}
try:
    result = supabase.table("mock_tests").insert(test_data).execute()
    print(f"✓ Created Mock Test: {test_data['title']}")
except Exception as e:
    print(f"✗ Error creating test: {str(e)}")

print("\nDone! GTU data populated.")
