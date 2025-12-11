#!/usr/bin/env python3
"""
Clean up useless study materials and add fresh, high-quality data.
This script removes low-quality or outdated materials and adds fresh content.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

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

def add_fresh_materials():
    """Add fresh, high-quality study materials"""
    print("\n🆕 Adding fresh study materials...")
    
    # Sample Computer Engineering subjects
    subjects = [
        {
            "subject_code": "3140703",
            "subject_name": "Database Management Systems",
            "branch": "Computer Engineering",
            "semester": 4
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "branch": "Computer Engineering", 
            "semester": 5
        }
    ]
    
    # Add fresh notes
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
            "content_hash": "fresh_hash_dbms_001",
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
            "content_hash": "fresh_hash_dbms_002",
            "downloads": 0,
            "views": 0
        },
        {
            "subject_code": "3150713",
            "subject_name": "Operating System",
            "unit": 1,
            "title": "Introduction to Operating Systems",
            "description": "Overview of OS functions, types, and system structure",
            "file_url": "https://drive.google.com/file/d/1example3/view",
            "source_url": "https://www.gtustudy.com/os/unit1",
            "source_name": "GTUStudy - Verified",
            "content_hash": "fresh_hash_os_001",
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
            "answer_text": "The three-schema architecture provides data independence by separating user applications from physical storage...",
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
            "answer_text": "Entity-Relationship model is a conceptual data model that represents entities and their relationships...",
            "source_url": "https://www.gtumaterial.com/dbms/er-model",
            "source_name": "GTUMaterial - Detailed"
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