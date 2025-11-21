import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def check_notes():
    # Get a subject first
    subjects = supabase.table("subjects").select("*").limit(1).execute()
    if not subjects.data:
        print("No subjects found")
        return

    subject_code = subjects.data[0]['subject_code']
    print(f"Checking notes for subject code: {subject_code}")

    # Get notes
    notes = supabase.table("notes").select("*").eq("subject_code", subject_code).execute()
    
    if not notes.data:
        print("No notes found for this subject")
        
        # Try to find any note
        all_notes = supabase.table("notes").select("*").limit(5).execute()
        if all_notes.data:
            print("\nFound other notes:")
            for n in all_notes.data:
                print(f"ID: {n['id']}, Title: {n['title']}, File URL: {n.get('file_url')}")
        else:
            print("No notes found in database at all")
        return

    for n in notes.data:
        print(f"ID: {n['id']}, Unit: {n['unit']}, Title: {n['title']}, File URL: {n.get('file_url')}")

if __name__ == "__main__":
    check_notes()
