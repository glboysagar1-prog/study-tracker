import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔄 Updating sample URLs with real, accessible links...\n")

# Update notes with real PDF URLs
notes_updates = [
    {
        "id": 1,
        "file_url": "https://www.tutorialspoint.com/dbms/dbms_tutorial.pdf"
    },
    {
        "id": 2,
        "file_url": "https://www.geeksforgeeks.org/wp-content/uploads/ER-model.pdf"
    },
    {
        "id": 3,
        "file_url": "https://www.studytonight.com/dbms/database-normalization.php"
    },
]

# Get all notes and update their URLs
all_notes = supabase.table("notes").select("*").execute()
print(f"Found {len(all_notes.data)} notes")

for i, note in enumerate(all_notes.data):
    if 'sample' in note.get('file_url', ''):
        # Update with a real URL - using direct PDF links
        new_url = f"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        
        try:
            supabase.table("notes").update({"file_url": new_url}).eq("id", note['id']).execute()
            print(f"✓ Updated note: {note['title'][:40]}")
        except Exception as e:
            print(f"✗ Failed to update note {note['id']}: {e}")

print("\n✅ Database updated with accessible URLs!")
print("\nNote: The sample PDFs now point to test/dummy PDFs.")
print("For real content, you should run the scraper to fetch actual study materials.")
