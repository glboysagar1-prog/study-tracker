# Supabase setup script
# This script helps initialize the Supabase database tables

from supabase import create_client
import os

def setup_supabase_tables():
    """Create required tables in Supabase"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        return
    
    supabase = create_client(url, key)
    
    # Note: In Supabase, tables are typically created via the dashboard or SQL editor
    # This script is for reference only
    print("Supabase setup information:")
    print("- Create tables using the Supabase SQL editor")
    print("- Required tables: users, subjects, syllabus, questions, previous_papers, mock_tests")
    print("- Refer to backend/models.py for table structures")
    
    # Example table creation SQL (for reference only):
    table_creation_sql = """
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(80) UNIQUE NOT NULL,
        email VARCHAR(120) UNIQUE NOT NULL,
        password_hash VARCHAR(128) NOT NULL,
        college VARCHAR(100),
        branch VARCHAR(100),
        semester VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Subjects table
    CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        course VARCHAR(100) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        semester VARCHAR(10) NOT NULL,
        subject_code VARCHAR(50) NOT NULL,
        subject_name VARCHAR(255) NOT NULL,
        credits INTEGER,
        syllabus_pdf_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Syllabus table
    CREATE TABLE IF NOT EXISTS syllabus (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subjects(id),
        unit_number INTEGER NOT NULL,
        unit_title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Questions table
    CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subjects(id),
        unit_number INTEGER,
        question_text TEXT NOT NULL,
        marks INTEGER NOT NULL,
        question_type VARCHAR(50),
        options JSONB,
        correct_answer TEXT,
        ai_explanation TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Previous papers table
    CREATE TABLE IF NOT EXISTS previous_papers (
        id SERIAL PRIMARY KEY,
        subject_id INTEGER REFERENCES subjects(id),
        year INTEGER NOT NULL,
        exam_type VARCHAR(50),
        paper_pdf_url TEXT,
        solution_pdf_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Mock tests table
    CREATE TABLE IF NOT EXISTS mock_tests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subject_id INTEGER REFERENCES subjects(id),
        title VARCHAR(255) NOT NULL,
        duration_minutes INTEGER DEFAULT 180,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        score FLOAT,
        max_score FLOAT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """
    
    print("\nExample SQL for table creation:")
    print(table_creation_sql)

if __name__ == "__main__":
    setup_supabase_tables()