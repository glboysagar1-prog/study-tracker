
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase credentials not found.")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_database():
    print("WARNING: This will delete ALL data from 'notes', 'previous_papers', and 'syllabus_content'.")
    print("Starting cleanup...")

    try:
        # 1. Clean notes
        print("Cleaning 'notes' table...")
        # Deleting all rows where id is not null (effectively all rows)
        # Supabase-py delete needs a filter usually.
        # We'll use a not-equal filter on a non-existent ID or just a broad filter if allowable.
        # Safest way to delete all is usually iterating or using a condition that matches all.
        # Let's try deleting where id > 0 (assuming int id) or id is not null (uuid).
        # Since we don't know the exact schema types without checking, let's try a common approach.
        # Or better, fetch IDs in batches and delete.
        
        tables = ["notes", "previous_papers", "syllabus_content"]
        
        for table in tables:
            print(f"  Processing table '{table}'...")
            
            # Fetch all IDs
            response = supabase.table(table).select("id").execute()
            ids = [row['id'] for row in response.data]
            
            if not ids:
                print(f"    Table '{table}' is already empty.")
                continue
                
            print(f"    Found {len(ids)} records to delete.")
            
            # Delete in batches of 100
            batch_size = 100
            for i in range(0, len(ids), batch_size):
                batch = ids[i:i+batch_size]
                supabase.table(table).delete().in_("id", batch).execute()
                print(f"    Deleted {len(batch)} records...")
                
            print(f"  Table '{table}' cleared.")

    except Exception as e:
        print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    clean_database()
