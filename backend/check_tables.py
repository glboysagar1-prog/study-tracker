import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.supabase_client import supabase

def check_tables():
    tables = ["lab_programs", "study_materials"]
    for table in tables:
        print(f"\nChecking table: {table}")
        try:
            # Try to insert an empty dict to trigger "null value in column..." error
            supabase.table(table).insert({}).execute()
        except Exception as e:
            print(f"Error on {table}: {e}")
            
    # Also check video_playlists columns again to be sure
    try:
        res = supabase.table("video_playlists").select("*").limit(1).execute()
        if res.data:
            print(f"\nvideo_playlists columns: {res.data[0].keys()}")
    except:
        pass

if __name__ == "__main__":
    check_tables()
