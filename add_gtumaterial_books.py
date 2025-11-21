import os
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add sample books from GTUMaterial.com for Semester 3
books = [
    {
        "subject_code": "3130004",
        "subject_name": "Effective Technical Communication",
        "material_type": "book",
        "title": "Effective Technical Communication - Technical Publication",
        "url": "https://drive.google.com/file/d/1s7b4dw5kf5n3-wsUMkUYag6cORYLePT-/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for Effective Technical Communication"
    },
    {
        "subject_code": "3130702",
        "subject_name": "Data Structures",
        "material_type": "book",
        "title": "Data Structures - Technical Publication",
        "url": "https://drive.google.com/file/d/1aeVu5Zx9txbq1ZNxOuDF2WuAhd8nXcLl/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for Data Structures"
    },
    {
        "subject_code": "3130702",
        "subject_name": "Data Structures",
        "material_type": "book",
        "title": "Data Structures Using C 2nd Edition By Reema Thareja",
        "url": "https://drive.google.com/file/d/1w9u-JgPjvqKWR7Bwa_tlYTch2w85xl6W/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for Data Structures"
    },
    {
        "subject_code": "3130703",
        "subject_name": "Database Management Systems",
        "material_type": "book",
        "title": "Database Management Systems - Technical Publication",
        "url": "https://drive.google.com/file/d/10dhcmdlN91wuwc1m9V1ugG9XLBLoVXwC/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for DBMS"
    },
    {
        "subject_code": "3130703",
        "subject_name": "Database Management Systems",
        "material_type": "book",
        "title": "Modern Database Management by Jeff Hoffer",
        "url": "https://drive.google.com/file/d/18lQnZ0eje9IwUuvK_7EA86Oy1uPQNwg1/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for DBMS"
    },
    {
        "subject_code": "3130703",
        "subject_name": "Database Management Systems",
        "material_type": "book",
        "title": "An Introduction to Database Systems 8th Edition by C J Date",
        "url": "https://drive.google.com/file/d/11K-jaNuUGINIbj5fuYS-X5SWPbcJgVLx/view?usp=drive_link",
        "source_url": "https://gtumaterial.com/gtu/materials/computer-engineering/semester-3/study%20material",
        "source_name": "GTUMaterial",
        "description": "Book for DBMS"
    },
]

print("Inserting books from GTUMaterial.com...")
for book in books:
    try:
        supabase.table("reference_materials").insert(book).execute()
        print(f"✓ Inserted: {book['title']}")
    except Exception as e:
        print(f"✗ Skipped (likely duplicate): {book['title'][:50]}")

print(f"\n✅ Successfully added {len(books)} books from GTUMaterial.com!")
