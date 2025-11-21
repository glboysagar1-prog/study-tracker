import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("🔄 Updating notes with real content URLs...\n")

# Real study material URLs from various sources
real_notes = [
    {
        "subject_code": "2140701",
        "unit": 1,
        "title": "Introduction to Data Structures",
        "description": "Complete notes on arrays, pointers, and basic data structures",
        "file_url": "https://www.tutorialspoint.com/data_structures_algorithms/data_structures_basics.htm",
        "source_name": "TutorialsPoint",
        "source_url": "https://www.tutorialspoint.com/data_structures_algorithms/index.htm"
    },
    {
        "subject_code": "2140701",
        "unit": 2,
        "title": "Stacks and Queues - Complete Guide",
        "description": "Implementation and applications of stacks and queues",
        "file_url": "https://www.geeksforgeeks.org/stack-data-structure/",
        "source_name": "GeeksforGeeks",
        "source_url": "https://www.geeksforgeeks.org/data-structures/"
    },
    {
        "subject_code": "2140701",
        "unit": 3,
        "title": "Linked Lists Tutorial",
        "description": "Singly, doubly, and circular linked lists with examples",
        "file_url": "https://www.programiz.com/dsa/linked-list",
        "source_name": "Programiz",
        "source_url": "https://www.programiz.com/dsa"
    },
    {
        "subject_code": "3140703",
        "unit": 1,
        "title": "Introduction to DBMS",
        "description": "Database concepts, architecture, and data models",
        "file_url": "https://www.javatpoint.com/dbms-tutorial",
        "source_name": "JavaTpoint",
        "source_url": "https://www.javatpoint.com/dbms-tutorial"
    },
    {
        "subject_code": "3140703",
        "unit": 2,
        "title": "Relational Model and SQL",
        "description": "Relational algebra, SQL queries, and database design",
        "file_url": "https://www.w3schools.com/sql/",
        "source_name": "W3Schools",
        "source_url": "https://www.w3schools.com/sql/"
    },
    {
        "subject_code": "3140703",
        "unit": 3,
        "title": "Normalization and Database Design",
        "description": "Functional dependencies, normal forms (1NF, 2NF, 3NF, BCNF)",
        "file_url": "https://www.studytonight.com/dbms/database-normalization.php",
        "source_name": "StudyTonight",
        "source_url": "https://www.studytonight.com/dbms/"
    },
]

# Delete old notes with dummy URLs
print("🗑️  Deleting old notes with dummy URLs...")
old_notes = supabase.table("notes").select("*").execute()
for note in old_notes.data:
    if 'dummy' in note.get('file_url', '').lower() or 'sample' in note.get('file_url', '').lower():
        supabase.table("notes").delete().eq("id", note['id']).execute()
        print(f"  ✓ Deleted: {note['title'][:40]}")

# Insert new notes with real URLs
print("\n📝 Adding notes with real content URLs...")
for note in real_notes:
    try:
        supabase.table("notes").insert(note).execute()
        print(f"  ✓ Added: {note['title']}")
    except Exception as e:
        print(f"  ⚠️  Skipped (may already exist): {note['title']}")

print("\n✅ Notes updated successfully!")
print("\n📌 All notes now point to real educational content from:")
print("   • TutorialsPoint")
print("   • GeeksforGeeks")
print("   • Programiz")
print("   • JavaTpoint")
print("   • W3Schools")
print("   • StudyTonight")
print("\n💡 These are high-quality learning resources with complete tutorials!")
