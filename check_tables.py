import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("Checking tables...")
try:
    # This might not work if permissions are restricted, but worth a try
    # We can try to select from a non-existent table to get a specific error, 
    # or try to list tables via rpc if available.
    # But standard way is usually restricted.
    # Let's try to just select * from the tables we suspect exist/don't exist to see the error.
    
    tables_to_check = ["subjects", "notes", "study_materials", "video_playlists", "important_questions", "lab_programs", "reference_materials"]
    
    for table in tables_to_check:
        print(f"\nChecking table: {table}")
        try:
            # Try to fetch one row
            response = supabase.table(table).select("*").limit(1).execute()
            print(f"  ✅ Table '{table}' exists.")
            if response.data:
                print(f"     Columns: {list(response.data[0].keys())}")
            else:
                print("     (Table is empty, cannot list columns easily without metadata query)")
        except Exception as e:
            print(f"  ❌ Error accessing '{table}': {e}")

except Exception as e:
    print(f"General error: {e}")
