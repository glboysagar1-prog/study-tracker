"""
Script to initialize Supabase tables for the GTU Exam Preparation Application
"""
import os
from supabase import create_client, Client

def init_supabase_tables():
    # Get Supabase credentials from environment
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        return
    
    # Create Supabase client
    supabase: Client = create_client(url, key)
    
    # Define table schemas
    tables = {
        "users": """
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                email VARCHAR(120) UNIQUE NOT NULL,
                password_hash VARCHAR(128) NOT NULL,
                college VARCHAR(100),
                branch VARCHAR(100),
                semester VARCHAR(10),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """,
        "subjects": """
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                course VARCHAR(100) NOT NULL,
                branch VARCHAR(100) NOT NULL,
                semester VARCHAR(10) NOT NULL,
                subject_code VARCHAR(50) NOT NULL,
                subject_name VARCHAR(255) NOT NULL,
                credits INTEGER NOT NULL
            );
        """,
        "syllabus": """
            CREATE TABLE IF NOT EXISTS syllabus (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                unit_number INTEGER NOT NULL,
                unit_title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL
            );
        """,
        "questions": """
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                unit_number INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                marks INTEGER NOT NULL,
                question_type VARCHAR(20) NOT NULL,  -- 'mcq', 'short', 'long'
                options JSONB,  -- For MCQ options
                ai_explanation TEXT
            );
        """,
        "previous_papers": """
            CREATE TABLE IF NOT EXISTS previous_papers (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                year VARCHAR(10) NOT NULL,
                exam_type VARCHAR(50) NOT NULL,  -- 'Regular', 'Re-exam', etc.
                paper_pdf_url TEXT,
                solution_pdf_url TEXT
            );
        """,
        "mock_tests": """
            CREATE TABLE IF NOT EXISTS mock_tests (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                title VARCHAR(255) NOT NULL,
                duration_minutes INTEGER NOT NULL,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                score INTEGER,
                max_score INTEGER
            );
        """,
        "test_questions": """
            CREATE TABLE IF NOT EXISTS test_questions (
                id SERIAL PRIMARY KEY,
                test_id INTEGER REFERENCES mock_tests(id),
                question_id INTEGER REFERENCES questions(id),
                user_answer TEXT,
                is_correct BOOLEAN
            );
        """,
        "study_materials": """
            CREATE TABLE IF NOT EXISTS study_materials (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                material_type VARCHAR(50) NOT NULL,  -- 'notes', 'flashcards', 'summary'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """
    }
    
    # Create tables
    print("Initializing Supabase tables...")
    for table_name, schema in tables.items():
        try:
            # Note: Supabase doesn't support raw SQL execution through the Python client
            # This is just for documentation purposes
            print(f"Table '{table_name}' schema defined (create manually in Supabase dashboard)")
        except Exception as e:
            print(f"Error creating table '{table_name}': {str(e)}")
    
    print("\nSupabase tables initialization complete!")
    print("\nNext steps:")
    print("1. Create these tables manually in your Supabase dashboard")
    print("2. Add the required Row Level Security (RLS) policies")
    print("3. Add sample data if needed")

if __name__ == "__main__":
    init_supabase_tables()