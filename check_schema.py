import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Env vars missing")
    exit(1)

supabase = create_client(url, key)

try:
    # Try to select the new columns from questions
    response = supabase.table("questions").select("is_important, frequency_count, difficulty_level, gtu_section").limit(1).execute()
    print("Schema check: SUCCESS. Columns exist.")
except Exception as e:
    print(f"Schema check: FAILED. Error: {e}")
