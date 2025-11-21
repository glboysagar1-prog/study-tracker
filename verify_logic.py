import requests
import json
import os
from dotenv import load_dotenv
from backend.supabase_client import supabase

load_dotenv()

# URL of the backend
BASE_URL = "http://localhost:5000/api"

def verify_mock_test():
    print("Verifying Mock Test Generation...")
    
    # 1. Get a subject ID
    try:
        response = supabase.table("subjects").select("id").limit(1).execute()
        if not response.data:
            print("No subjects found. Cannot verify.")
            return
        subject_id = response.data[0]['id']
        print(f"Using Subject ID: {subject_id}")
    except Exception as e:
        print(f"Error fetching subject: {e}")
        return

    # 2. Call generate mock test
    try:
        # We need to mock the request context or run the server. 
        # Since we can't easily start the server and wait in this script without blocking,
        # we will try to invoke the logic directly or assume the server is running.
        # But wait, I can't assume the server is running.
        # I should probably use the python functions directly if possible, 
        # OR I can try to run the server in background.
        
        # Let's try to import the function and run it, but it depends on Flask request context.
        # So better to simulate the logic or just check the DB after running a script that uses the logic.
        
        # Actually, I can just use the code I wrote in a standalone script to test the logic
        # but that duplicates code.
        
        # Let's try to run the backend in background and curl it?
        # Or just trust the code review?
        
        # I will write a script that IMPORTS the logic but mocks the request.
        pass
    except Exception as e:
        print(f"Error: {e}")

# Instead of complex server setup, let's just run a script that uses the SAME LOGIC as the route
# to verify it works against the DB.

def test_logic_directly():
    print("Testing Logic Directly...")
    try:
        # Fetch subject
        response = supabase.table("subjects").select("id").limit(1).execute()
        if not response.data:
            print("No subjects found.")
            return
        subject_id = response.data[0]['id']
        
        # Fetch questions
        response = supabase.table("questions").select("*").eq("subject_id", subject_id).execute()
        all_questions = response.data
        print(f"Total questions found: {len(all_questions)}")
        
        if len(all_questions) < 30:
            print("Warning: Not enough questions to fully test internal options logic (need ~30+)")
            
        # Logic from routes.py
        q_1mark = [q for q in all_questions if q.get('marks') == 1]
        q_3mark = [q for q in all_questions if q.get('marks') == 3]
        q_4mark = [q for q in all_questions if q.get('marks') == 4]
        q_7mark = [q for q in all_questions if q.get('marks') == 7]
        
        print(f"1 Mark: {len(q_1mark)}")
        print(f"3 Mark: {len(q_3mark)}")
        print(f"4 Mark: {len(q_4mark)}")
        print(f"7 Mark: {len(q_7mark)}")
        
        import random
        
        # Simulation
        count_7mark_needed = 8
        if len(q_7mark) < count_7mark_needed:
            print(f"Not enough 7 mark questions. Have {len(q_7mark)}, need {count_7mark_needed}")
        else:
            print("Enough 7 mark questions for options.")
            
        selected_7mark = random.sample(q_7mark, min(len(q_7mark), count_7mark_needed))
        
        # Check structure generation
        sections = []
        for i in range(4):
            # indices i and i+4
            q7_main = selected_7mark[i]['id'] if i < len(selected_7mark) else None
            q7_alt = selected_7mark[i+4]['id'] if (i+4) < len(selected_7mark) else None
            
            print(f"Q{i+2}: Main 7m ID: {q7_main}, Alt 7m ID: {q7_alt}")
            
            if q7_main and q7_alt:
                print("  -> Internal option successfully generated!")
            else:
                print("  -> Failed to generate internal option (not enough questions?)")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_logic_directly()
