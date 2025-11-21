"""
Add sample material data for testing
This populates the database with test notes, questions, and references
so you can see the system working before running scrapers.
"""
import os
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY required")
    exit(1)

supabase = create_client(url, key)

print("Adding sample material data...")
print("="*60)

# Sample subject codes (should exist from previous setup)
SUBJECT_CODE = "3140703"  # DBMS
SUBJECT_NAME = "Database Management Systems"

# Add sample notes
notes_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 1,
        "title": "Introduction to Database Systems",
        "description": "Comprehensive notes covering database fundamentals",
        "file_url": "https://example.com/dbms-unit1.pdf",
        "source_url": "https://www.gtustudy.com/dbms/unit1",
        "source_name": "GTUStudy",
        "content_hash": "test_hash_001"
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "title": "ER Model and Normalization",
        "description": "Entity-Relationship diagrams and normal forms",
        "file_url": "https://example.com/dbms-unit2.pdf",
        "source_url": "https://www.gtustudy.com/dbms/unit2",
        "source_name": "GTUStudy",
        "content_hash": "test_hash_002"
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 3,
        "title": "SQL and Query Processing",
        "description": "SQL syntax, joins, and query optimization",
        "file_url": "https://example.com/dbms-unit3.pdf",
        "source_url": "https://www.gtumaterial.com/sql",
        "source_name": "GTUMaterial",
        "content_hash": "test_hash_003"
    }
]

# Add sample important questions
questions_data = [
    {
        "subject_code": SUBJECT_CODE,
        "unit": 1,
        "question_text": "Explain the three-schema architecture of DBMS with a neat diagram.",
        "marks": 7,
        "difficulty": "medium",
        "frequency": 5,
        "last_asked_year": 2024,
        "answer_text": "The three-schema architecture consists of external schema, conceptual schema, and internal schema...",
        "source_url": "https://www.gtustudy.com/dbms/questions",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 2,
        "question_text": "What is normalization? Explain 1NF, 2NF, and 3NF with examples.",
        "marks": 7,
        "difficulty": "hard",
        "frequency": 8,
        "last_asked_year": 2024,
        "answer_text": "Normalization is the process of organizing data to reduce redundancy...",
        "source_url": "https://www.gtustudy.com/dbms/important",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 2,
        "question_text": "Define primary key, foreign key, and candidate key.",
        "marks": 3,
        "difficulty": "easy",
        "frequency": 6,
        "last_asked_year": 2023,
        "source_url": "https://www.gtumaterial.com/keys",
        "source_name": "GTUMaterial"
    }
]

# Add sample reference materials
references_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "book",
        "title": "Database System Concepts",
        "author": "Silberschatz, Korth, Sudarshan",
        "description": "Comprehensive textbook on database systems",
        "url": "https://www.db-book.com",
        "source_url": "https://www.gtustudy.com/references",
        "source_name": "GTUStudy",
        "isbn": "9780078022159",
        "publisher": "McGraw-Hill",
        "year": 2019
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "video",
        "title": "Stanford Database Course",
        "author": "Jennifer Widom",
        "description": "Complete video lectures on database systems",
        "url": "https://www.youtube.com/playlist?list=PLroEs25KGvwzmvIxYHRhoGTz9w8LeXek0",
        "source_url": "https://www.gtumaterial.com/videos",
        "source_name": "GTUMaterial",
        "year": 2021
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "pdf",
        "title": "SQL Tutorial Guide",
        "description": "Comprehensive SQL reference guide",
        "url": "https://www.w3schools.com/sql/sql_intro.asp",
        "source_url": "https://www.gtustudy.com/sql-guide",
        "source_name": "GTUStudy"
    }
]

# Add sample syllabus content
syllabus_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 1,
        "unit_title": "Introduction to Database Systems",
        "topic": "Database System Architecture",
        "content": "Three-schema architecture, Data independence, Database users and DBA",
        "source_url": "https://www.gtustudy.com/syllabus/dbms"
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "unit_title": "ER Model and Relational Model",
        "topic": "Entity-Relationship Model",
        "content": "Entities, attributes, relationships, ER diagrams, weak entities",
        "source_url": "https://www.gtustudy.com/syllabus/dbms"
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "unit_title": "ER Model and Relational Model",
        "topic": "Normalization",
        "content": "Functional dependencies, Normal forms (1NF, 2NF, 3NF, BCNF), Decomposition",
        "source_url": "https://www.gtumaterial.com/syllabus"
    }
]

# Insert data
try:
    # Insert notes
    print("\nInserting sample notes...")
    for note in notes_data:
        try:
            supabase.table("notes").insert(note).execute()
            print(f"  ✓ Added note: {note['title']}")
        except Exception as e:
            print(f"  ⚠ Skipped (may already exist): {note['title']}")
    
    # Insert questions
    print("\nInserting sample questions...")
    for question in questions_data:
        try:
            supabase.table("important_questions").insert(question).execute()
            print(f"  ✓ Added question ({question['marks']}M)")
        except Exception as e:
            print(f"  ⚠ Skipped question")
    
    # Insert references
    print("\nInserting sample references...")
    for ref in references_data:
        try:
            supabase.table("reference_materials").insert(ref).execute()
            print(f"  ✓ Added reference: {ref['title']}")
        except Exception as e:
            print(f"  ⚠ Skipped (may already exist): {ref['title']}")
    
    # Insert syllabus
    print("\nInserting sample syllabus content...")
    for content in syllabus_data:
        try:
            supabase.table("syllabus_content").insert(content).execute()
            print(f"  ✓ Added syllabus: Unit {content['unit']} - {content['topic']}")
        except Exception as e:
            print(f"  ⚠ Skipped syllabus content")
    
    print("\n" + "="*60)
    print("✅ Sample data added successfully!")
    print("\nYou can now:")
    print("  1. Test backend APIs: python3 test_material_apis.py")
    print("  2. View in Supabase dashboard")
    print("  3. Test frontend components")
    print("="*60)

except Exception as e:
    print(f"\n❌ Error adding sample data: {str(e)}")
    print("\nMake sure:")
    print("  1. Database schema is applied")
    print("  2. .env file has correct Supabase credentials")
    print("  3. Tables exist in Supabase")
