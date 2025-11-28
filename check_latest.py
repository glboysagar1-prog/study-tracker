import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from backend.supabase_client import supabase

def check_latest_notes():
    try:
        # Fetch latest 5 notes
        res = supabase.table("notes").select("id, title, source_name, file_url, created_at").order("created_at", desc=True).limit(5).execute()
        
        if res.data:
            print(f"Found {len(res.data)} recent notes:")
            for note in res.data:
                print(f"ID: {note['id']}")
                print(f"Title: {note['title']}")
                print(f"Source: {note['source_name']}")
                print(f"URL: {note['file_url']}")
                print("-" * 30)
        else:
            print("No notes found.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_latest_notes()
