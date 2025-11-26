import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.supabase_client import supabase

def check_tables():
    # Authenticate first
    try:
        email = "seeder@gtu.edu"
        password = "seederpassword123"
        supabase.auth.sign_in_with_password({"email": email, "password": password})
        print("Authenticated.")
    except Exception as e:
        print(f"Auth failed: {e}")

    tables = ["study_materials"]
    for table in tables:
        print(f"\nChecking table: {table}")
        try:
            # Try to insert an empty dict to trigger "null value in column..." error
            res = supabase.table(table).insert({}).execute()
            if res.data:
                print(f"Inserted into {table}. Columns: {res.data[0].keys()}")
        except Exception as e:
            print(f"Error on {table}: {e}")

if __name__ == "__main__":
    check_tables()
