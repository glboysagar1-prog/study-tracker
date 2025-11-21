import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

subject_data = {
    "subject_code": "3110005",
    "subject_name": "Basic Electronics",
    "branch": "Computer Engineering",
    "semester": 1,
    "credits": 4,
    "course": "BE"
}

try:
    # Check if subject exists
    res = supabase.table("subjects").select("*").eq("subject_code", "3110005").execute()
    if not res.data:
        # Insert subject
        supabase.table("subjects").insert(subject_data).execute()
        print("Inserted dummy subject: Basic Electronics")
    else:
        print("Subject already exists")

    # Insert some dummy study materials
    materials = [
        {
            "subject_code": "3110005",
            "title": "Unit 1 Notes",
            "material_type": "notes",
            "description": "Introduction to Electronics",
            "unit": 1,
            "file_url": "https://example.com/notes.pdf",
            "is_verified": True,
            "created_at": "now()"
        },
        {
            "subject_code": "3110005",
            "title": "Lab Manual",
            "material_type": "lab",
            "description": "Complete Lab Manual",
            "unit": 0,
            "file_url": "https://example.com/lab.pdf",
            "is_verified": True,
            "created_at": "now()"
        }
    ]
    
    for mat in materials:
        supabase.table("study_materials").insert(mat).execute()
    print("Inserted dummy materials")

except Exception as e:
    print(f"Error: {e}")
