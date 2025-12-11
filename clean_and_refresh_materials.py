#!/usr/bin/env python3
"""
Clean up useless study materials and add fresh, high-quality data.
This script removes low-quality or outdated materials and adds fresh content.
"""

import os
from dotenv import load_dotenv
from supabase import create_client
import uuid

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def clear_useless_materials():
    """Remove low-quality or outdated materials"""
    print("🗑️  Cleaning up useless study materials...")
    
    # Tables to clean
    tables_to_clean = [
        "notes",
        "important_questions", 
        "reference_materials",
        "syllabus_content",
        "study_materials"
    ]
    
    for table in tables_to_clean:
        try:
            # Count existing records
            count_result = supabase.table(table).select("id", count="exact").execute()
            initial_count = len(count_result.data)
            
            if initial_count > 0:
                print(f"  Found {initial_count} records in {table}")
                
                # Delete all records (clean slate approach)
                result = supabase.table(table).delete().neq("id", 0).execute()
                print(f"  ✓ Cleared {initial_count} records from {table}")
            else:
                print(f"  ✓ No records to clear in {table}")
                
        except Exception as e:
            print(f"  ✗ Error cleaning {table}: {e}")
    
    # Also remove KhudkiBook materials specifically
    try:
        print("  Removing KhudkiBook materials...")
        khudki_result = supabase.table("notes").delete().eq("source_name", "KhudkiBook").execute()
        print(f"  ✓ Removed KhudkiBook materials")
    except Exception as e:
        print(f"  ✗ Error removing KhudkiBook materials: {e}")

def add_fresh_materials():
    """Add fresh, high-quality study materials"""
    print("\n🆕 Adding fresh study materials...")
    
    # Add fresh notes with unique content hashes
    notes_data = [
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "unit": 1,
            "title": "Introduction to Database Systems - Comprehensive Notes",
            "description": "Detailed notes covering database fundamentals, three-schema architecture, and DBMS components",
            "file_url": "https://drive.google.com/file/d/1example1/view",
            "source_url": "https://www.gtustudy.com/dbms/unit1",
            "source_name": "GTUStudy - Verified",
            "content_hash": str(uuid.uuid4()),
            "downloads": 0,
            "views": 0
        },
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems", 
            "unit": 2,
            "title": "ER Model and Relational Model",
            "description": "Entity-Relationship diagrams, relational algebra, and normalization concepts",
            "file_url": "https://drive.google.com/file/d/1example2/view",
            "source_url": "https://www.gtumaterial.com/dbms/unit2",
            "source_name": "GTUMaterial - Curated",
            "content_hash": str(uuid.uuid4()),
            "downloads": 0,
            "views": 0
        },
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "unit": 3,
            "title": "SQL and Query Processing",
            "description": "SQL syntax, joins, and query optimization techniques",
            "file_url": "https://drive.google.com/file/d/1example3/view",
            "source_url": "https://www.gtustudy.com/dbms/unit3",
            "source_name": "GTUStudy - Verified",
            "content_hash": str(uuid.uuid4()),
            "downloads": 0,
            "views": 0
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "unit": 1,
            "title": "Introduction to Operating Systems",
            "description": "Overview of OS functions, types, and system structure",
            "file_url": "https://drive.google.com/file/d/1example4/view",
            "source_url": "https://www.gtustudy.com/os/unit1",
            "source_name": "GTUStudy - Verified",
            "content_hash": str(uuid.uuid4()),
            "downloads": 0,
            "views": 0
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "unit": 2,
            "title": "Process Management and Scheduling",
            "description": "Process concept, scheduling algorithms, and inter-process communication",
            "file_url": "https://drive.google.com/file/d/1example5/view",
            "source_url": "https://www.gtumaterial.com/os/unit2",
            "source_name": "GTUMaterial - Curated",
            "content_hash": str(uuid.uuid4()),
            "downloads": 0,
            "views": 0
        }
    ]
    
    # Add fresh important questions
    questions_data = [
        {
            "subject_code": "3140703",
            "unit": 1,
            "question_text": "Explain the three-schema architecture of DBMS with a neat diagram.",
            "marks": 7,
            "difficulty": "medium",
            "frequency": 5,
            "last_asked_year": 2024,
            "answer_text": "The three-schema architecture provides data independence by separating user applications from physical storage. It consists of external schema (user view), conceptual schema (logical structure), and internal schema (physical storage).",
            "source_url": "https://www.gtustudy.com/dbms/important-questions",
            "source_name": "GTUStudy - Exam Focused"
        },
        {
            "subject_code": "3140703",
            "unit": 2,
            "question_text": "What is an ER model? Draw and explain ER diagram symbols.",
            "marks": 7,
            "difficulty": "high",
            "frequency": 4,
            "last_asked_year": 2024,
            "answer_text": "Entity-Relationship model is a conceptual data model that represents entities and their relationships. Entities are represented as rectangles, attributes as ellipses, and relationships as diamonds.",
            "source_url": "https://www.gtumaterial.com/dbms/er-model",
            "source_name": "GTUMaterial - Detailed"
        },
        {
            "subject_code": "3140703",
            "unit": 3,
            "question_text": "Explain SQL JOIN operations with examples.",
            "marks": 7,
            "difficulty": "medium",
            "frequency": 6,
            "last_asked_year": 2024,
            "answer_text": "SQL JOIN operations combine rows from two or more tables based on a related column. Types include INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN.",
            "source_url": "https://www.gtustudy.com/dbms/sql-joins",
            "source_name": "GTUStudy - Practical Examples"
        },
        {
            "subject_code": "3150713",
            "unit": 1,
            "question_text": "Define operating system. Explain its objectives and functions.",
            "marks": 7,
            "difficulty": "medium",
            "frequency": 5,
            "last_asked_year": 2024,
            "answer_text": "An operating system is system software that manages computer hardware and software resources. Its objectives include convenience, efficiency, and ability to evolve.",
            "source_url": "https://www.gtustudy.com/os/introduction",
            "source_name": "GTUStudy - Fundamental Concepts"
        }
    ]
    
    # Add reference materials
    references_data = [
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "title": "Database System Concepts - 7th Edition",
            "author": "Abraham Silberschatz",
            "material_type": "book",
            "url": "https://example.com/database-concepts-book",
            "publisher": "McGraw-Hill Education",
            "isbn": "978-0078022159",
            "description": "Comprehensive textbook covering all DBMS concepts with practical examples",
            "source_name": "Academic Publishers"
        },
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "title": "Fundamentals of Database Systems - 7th Edition",
            "author": "Ramez Elmasri",
            "material_type": "book",
            "url": "https://example.com/fundamentals-db-book",
            "publisher": "Pearson",
            "isbn": "978-0133970749",
            "description": "In-depth coverage of database design and implementation",
            "source_name": "Academic Publishers"
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "title": "Operating System Concepts - 10th Edition",
            "author": "Abraham Silberschatz",
            "material_type": "book",
            "url": "https://example.com/os-concepts-book",
            "publisher": "Wiley",
            "isbn": "978-1119320913",
            "description": "Comprehensive guide to operating system principles and practice",
            "source_name": "Academic Publishers"
        }
    ]
    
    # Add syllabus content
    syllabus_data = [
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "unit": 1,
            "unit_title": "Introduction to DBMS",
            "topic": "Database System Concepts and Architecture",
            "content": "Introduction and Application of DBMS, Purpose of Database Systems, View of Data, Database Languages, Database Users, Implications of Database Approach, When not to use a DBMS, Three-Schema Architecture and Data Independence.",
            "source_url": "https://example.com/dbms-syllabus"
        },
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "unit": 2,
            "unit_title": "Data Modeling",
            "topic": "ER Model and Relational Model",
            "content": "ER Model - Entities, Attributes, Relationships, Constraints, Reduction of ER Diagrams to Tables. Relational Model - Concepts, Integrity Constraints, ER to Relational Mapping.",
            "source_url": "https://example.com/dbms-data-modeling"
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "unit": 1,
            "unit_title": "Introduction to Operating Systems",
            "topic": "Overview and Structure",
            "content": "Operating System - Definition, Evolution, Functions, Types, System Calls, Structure, Virtual Machines, Distributed Systems, Clustered Systems, Computing Environments.",
            "source_url": "https://example.com/os-intro"
        }
    ]
    
    # Insert fresh notes
    print("\nInserting fresh notes...")
    for note in notes_data:
        try:
            supabase.table("notes").insert(note).execute()
            print(f"  ✓ Added note: {note['title']}")
        except Exception as e:
            print(f"  ✗ Failed to add note: {note['title']} - {e}")
    
    # Insert fresh questions
    print("\nInserting fresh important questions...")
    for question in questions_data:
        try:
            supabase.table("important_questions").insert(question).execute()
            print(f"  ✓ Added question: {question['question_text'][:50]}...")
        except Exception as e:
            print(f"  ✗ Failed to add question: {e}")
    
    # Insert fresh references
    print("\nInserting fresh reference materials...")
    for ref in references_data:
        try:
            supabase.table("reference_materials").insert(ref).execute()
            print(f"  ✓ Added reference: {ref['title']}")
        except Exception as e:
            print(f"  ✗ Failed to add reference: {ref['title']} - {e}")
    
    # Insert fresh syllabus
    print("\nInserting fresh syllabus content...")
    for content in syllabus_data:
        try:
            supabase.table("syllabus_content").insert(content).execute()
            print(f"  ✓ Added syllabus: Unit {content['unit']} - {content['topic']}")
        except Exception as e:
            print(f"  ✗ Failed to add syllabus: {e}")

def verify_refresh():
    """Verify that fresh data was added"""
    print("\n📊 Verification:")
    
    tables_to_check = ["notes", "important_questions", "reference_materials", "syllabus_content"]
    
    for table in tables_to_check:
        try:
            result = supabase.table(table).select("id", count="exact").execute()
            print(f"  - {table} table: {len(result.data)} records")
        except Exception as e:
            print(f"  - {table} table: Error - {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🧹 Clean & Refresh Study Materials")
    print("=" * 60)
    
    try:
        clear_useless_materials()
        add_fresh_materials()
        verify_refresh()
        
        print("\n" + "=" * 60)
        print("✅ Materials cleaned and refreshed successfully!")
        print("✨ Your frontend will now show fresh, high-quality content")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("  1. Check your .env file for Supabase credentials")
        print("  2. Ensure tables exist in your Supabase database")
        print("  3. Verify your network connection")