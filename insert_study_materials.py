"""
Fixed script to properly insert notes and questions into database
Handles unique constraints and provides detailed error reporting
"""
import os
from dotenv import load_dotenv
from supabase import create_client
import hashlib
from datetime import datetime

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ Error: SUPABASE_URL and SUPABASE_KEY required")
    exit(1)

supabase = create_client(url, key)

print("="*60)
print("Adding Study Material Data - Fixed Version")
print("="*60)

SUBJECT_CODE = "3140703"
SUBJECT_NAME = "Database Management Systems"

# Generate unique hashes for notes
def generate_hash(text):
    return hashlib.md5(text.encode()).hexdigest()

# Clear existing test data first (optional - comment out if you want to keep)
print("\n🗑️  Clearing any existing test data...")
try:
    # Delete by content_hash pattern
    supabase.table("notes").delete().like("content_hash", "fixed_%").execute()
    print("  ✓ Cleared old test notes")
except:
    pass

# Properly structured notes with unique hashes
notes_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 1,
        "title": "Introduction to DBMS - Complete Notes",
        "description": "Comprehensive notes covering database system concepts, architecture, and data models",
        "file_url": "https://drive.google.com/file/d/sample1/view",
        "source_url": "https://www.gtustudy.com/subjects/dbms/unit-1",
        "source_name": "GTUStudy",
        "content_hash": generate_hash("dbms_intro_unit1_v1")
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "title": "ER Model and Relational Model Notes",
        "description": "Entity-Relationship diagrams, weak entities, and relational model concepts",
        "file_url": "https://drive.google.com/file/d/sample2/view",
        "source_url": "https://www.gtustudy.com/subjects/dbms/unit-2",
        "source_name": "GTUStudy",
        "content_hash": generate_hash("dbms_er_unit2_v1")
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 2,
        "title": "Normalization - Complete Guide",
        "description": "Functional dependencies, 1NF, 2NF, 3NF, BCNF with solved examples",
        "file_url": "https://drive.google.com/file/d/sample3/view",
        "source_url": "https://www.gtumaterial.com/dbms/normalization",
        "source_name": "GTUMaterial",
        "content_hash": generate_hash("dbms_normalization_v1")
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 3,
        "title": "SQL Tutorial - Beginner to Advanced",
        "description": "Complete SQL coverage: DDL, DML, DCL, joins, subqueries, and optimization",
        "file_url": "https://drive.google.com/file/d/sample4/view",
        "source_url": "https://www.gtustudy.com/subjects/dbms/unit-3",
        "source_name": "GTUStudy",
        "content_hash": generate_hash("dbms_sql_unit3_v1")
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "unit": 4,
        "title": "Transaction Management Notes",
        "description": "ACID properties, concurrency control, locking, and recovery",
        "file_url": "https://drive.google.com/file/d/sample5/view",
        "source_url": "https://www.gtumaterial.com/dbms/transactions",
        "source_name": "GTUMaterial",
        "content_hash": generate_hash("dbms_transactions_unit4_v1")
    }
]

# Important questions with unique content
questions_data = [
    {
        "subject_code": SUBJECT_CODE,
        "unit": 1,
        "question_text": "Explain the three-schema architecture of DBMS with a neat diagram. Discuss data independence.",
        "marks": 7,
        "difficulty": "medium",
        "frequency": 5,
        "last_asked_year": 2024,
        "answer_text": "The three-schema architecture consists of: 1) External Schema (view level), 2) Conceptual Schema (logical level), 3) Internal Schema (physical level). Data independence allows changes at one level without affecting others.",
        "source_url": "https://www.gtustudy.com/important-questions/dbms",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 1,
        "question_text": "What are the advantages and disadvantages of DBMS over file system?",
        "marks": 4,
        "difficulty": "easy",
        "frequency": 7,
        "last_asked_year": 2024,
        "answer_text": "Advantages: Data redundancy control, data integrity, data security, concurrent access. Disadvantages: Cost, complexity, single point of failure.",
        "source_url": "https://www.gtustudy.com/important-questions/dbms",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 2,
        "question_text": "What is normalization? Explain 1NF, 2NF, 3NF, and BCNF with examples.",
        "marks": 7,
        "difficulty": "hard",
        "frequency": 9,
        "last_asked_year": 2024,
        "answer_text": "Normalization is the process of organizing data to reduce redundancy. 1NF: Atomic values. 2NF: No partial dependency. 3NF: No transitive dependency. BCNF: Stricter version of 3NF.",
        "source_url": "https://www.gtumaterial.com/important-questions/normalization",
        "source_name": "GTUMaterial"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 2,
        "question_text": "Define primary key, foreign key, candidate key, and super key with examples.",
        "marks": 3,
        "difficulty": "easy",
        "frequency": 8,
        "last_asked_year": 2023,
        "answer_text": "Primary Key: Unique identifier. Foreign Key: References primary key of another table. Candidate Key: Minimal super key. Super Key: One or more attributes that uniquely identify a tuple.",
        "source_url": "https://www.gtustudy.com/important-questions/keys",
        "source_name": "GTUStudy"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 3,
        "question_text": "Explain different types of JOIN operations in SQL with examples.",
        "marks": 7,
        "difficulty": "medium",
        "frequency": 6,
        "last_asked_year": 2024,
        "answer_text": "Types of JOINs: INNER JOIN (matching rows), LEFT JOIN (all from left table), RIGHT JOIN (all from right table), FULL OUTER JOIN (all rows), CROSS JOIN (cartesian product).",
        "source_url": "https://www.gtumaterial.com/sql-joins",
        "source_name": "GTUMaterial"
    },
    {
        "subject_code": SUBJECT_CODE,
        "unit": 4,
        "question_text": "What are ACID properties? Explain each property in detail.",
        "marks": 4,
        "difficulty": "medium",
        "frequency": 8,
        "last_asked_year": 2024,
        "answer_text": "ACID: Atomicity (all or nothing), Consistency (maintains database integrity), Isolation (concurrent transactions don't interfere), Durability (changes are permanent).",
        "source_url": "https://www.gtustudy.com/transactions",
        "source_name": "GTUStudy"
    }
]

# Reference materials
references_data = [
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "book",
        "title": "Database System Concepts (7th Edition)",
        "author": "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
        "description": "Comprehensive database textbook covering fundamentals to advanced topics",
        "url": "https://www.db-book.com",
        "source_url": "https://www.gtustudy.com/reference-books/dbms",
        "source_name": "GTUStudy",
        "isbn": "9780078022159",
        "publisher": "McGraw-Hill Education",
        "year": 2019
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "video",
        "title": "Stanford CS145 - Introduction to Databases",
        "author": "Jennifer Widom",
        "description": "Complete video lecture series on database systems from Stanford",
        "url": "https://www.youtube.com/playlist?list=PLroEs25KGvwzmvIxYHRhoGTz9w8LeXek0",
        "source_url": "https://www.gtumaterial.com/video-lectures/dbms",
        "source_name": "GTUMaterial",
        "year": 2021
    },
    {
        "subject_code": SUBJECT_CODE,
        "subject_name": SUBJECT_NAME,
        "material_type": "pdf",
        "title": "SQL Cheat Sheet and Quick Reference",
        "description": "Comprehensive SQL syntax reference with examples",
        "url": "https://www.sqltutorial.org/sql-cheat-sheet/",
        "source_url": "https://www.gtustudy.com/cheat-sheets/sql",
        "source_name": "GTUStudy"
    }
]

# Insert notes with error handling
print("\n📝 Inserting Notes...")
success_count = 0
error_count = 0

for note in notes_data:
    try:
        result = supabase.table("notes").insert(note).execute()
        if result.data:
            print(f"  ✓ Added: {note['title'][:50]}...")
            success_count += 1
        else:
            print(f"  ⚠️  Warning: {note['title'][:50]}...")
            error_count += 1
    except Exception as e:
        print(f"  ❌ Error: {note['title'][:50]}... - {str(e)}")
        error_count += 1

print(f"\n  Summary: {success_count} added, {error_count} failed")

# Insert questions
print("\n❓ Inserting Important Questions...")
success_count = 0
error_count = 0

for question in questions_data:
    try:
        result = supabase.table("important_questions").insert(question).execute()
        if result.data:
            print(f"  ✓ Added: Unit {question['unit']}, {question['marks']}M - {question['question_text'][:40]}...")
            success_count += 1
        else:
            print(f"  ⚠️  Warning: {question['question_text'][:40]}...")
            error_count += 1
    except Exception as e:
        print(f"  ❌ Error: {question['question_text'][:40]}... - {str(e)}")
        error_count += 1

print(f"\n  Summary: {success_count} added, {error_count} failed")

# Insert references
print("\n📚 Inserting Reference Materials...")
success_count = 0
error_count = 0

for ref in references_data:
    try:
        result = supabase.table("reference_materials").insert(ref).execute()
        if result.data:
            print(f"  ✓ Added: {ref['title']}")
            success_count += 1
        else:
            print(f"  ⚠️  Warning: {ref['title']}")
            error_count += 1
    except Exception as e:
        print(f"  ❌ Error: {ref['title']} - {str(e)}")
        error_count += 1

print(f"\n  Summary: {success_count} added, {error_count} failed")

# Verify data
print("\n" + "="*60)
print("✅ Data Insertion Complete!")
print("="*60)

print("\n📊 Verifying database content...")
try:
    notes_count = len(supabase.table("notes").select("id").execute().data)
    questions_count = len(supabase.table("important_questions").select("id").execute().data)
    references_count = len(supabase.table("reference_materials").select("id").execute().data)
    
    print(f"\n  Notes in database: {notes_count}")
    print(f"  Questions in database: {questions_count}")
    print(f"  References in database: {references_count}")
    
    print("\n🎉 You can now test:")
    print(f"  curl http://localhost:5004/api/notes/{SUBJECT_CODE}")
    print(f"  curl 'http://localhost:5004/api/materials/search?q=normalization'")
    print(f"  curl http://localhost:5004/api/reference-materials/{SUBJECT_CODE}")
    
except Exception as e:
    print(f"  ⚠️  Could not verify: {str(e)}")

print("="*60)
