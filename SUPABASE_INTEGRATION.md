# Supabase Integration for GTU Exam Preparation Application

## Overview
This document describes the integration of Supabase as the backend and storage solution for the GTU Exam Preparation Web Application, replacing the previous Flask/PostgreSQL setup.

## Changes Made

### 1. Backend Architecture
- Replaced Flask-SQLAlchemy with Supabase client
- Removed PostgreSQL database dependencies
- Updated all API endpoints to use Supabase REST API
- Updated authentication system to work with Supabase

### 2. Dependencies
Updated [requirements.txt](file:///Users/sagar/Documents/gtu/requirements.txt) to include:
- `supabase==2.4.5` - Supabase Python client
- `Flask-JWT-Extended==4.5.3` - JWT authentication
- Removed Flask-SQLAlchemy, psycopg2-binary, and Flask-Bcrypt

### 3. Configuration
Updated [.env.example](file:///Users/sagar/Documents/gtu/.env.example) to include:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase API key

### 4. Code Changes
- Updated authentication routes to use Supabase
- Updated API routes to fetch data from Supabase tables
- Removed database models and replaced with simple data classes
- Updated voice API to remove SQLAlchemy imports

## Required Supabase Tables

### users
- id (SERIAL PRIMARY KEY)
- username (VARCHAR(80) UNIQUE NOT NULL)
- email (VARCHAR(120) UNIQUE NOT NULL)
- password_hash (VARCHAR(128) NOT NULL)
- college (VARCHAR(100))
- branch (VARCHAR(100))
- semester (VARCHAR(10))
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### subjects
- id (SERIAL PRIMARY KEY)
- course (VARCHAR(100) NOT NULL)
- branch (VARCHAR(100) NOT NULL)
- semester (VARCHAR(10) NOT NULL)
- subject_code (VARCHAR(50) NOT NULL)
- subject_name (VARCHAR(255) NOT NULL)
- credits (INTEGER NOT NULL)

### syllabus
- id (SERIAL PRIMARY KEY)
- subject_id (INTEGER REFERENCES subjects(id))
- unit_number (INTEGER NOT NULL)
- unit_title (VARCHAR(255) NOT NULL)
- content (TEXT NOT NULL)

### questions
- id (SERIAL PRIMARY KEY)
- subject_id (INTEGER REFERENCES subjects(id))
- unit_number (INTEGER NOT NULL)
- question_text (TEXT NOT NULL)
- marks (INTEGER NOT NULL)
- question_type (VARCHAR(20) NOT NULL) - 'mcq', 'short', 'long'
- options (JSONB) - For MCQ options
- ai_explanation (TEXT)

### previous_papers
- id (SERIAL PRIMARY KEY)
- subject_id (INTEGER REFERENCES subjects(id))
- year (VARCHAR(10) NOT NULL)
- exam_type (VARCHAR(50) NOT NULL) - 'Regular', 'Re-exam', etc.
- paper_pdf_url (TEXT)
- solution_pdf_url (TEXT)

### mock_tests
- id (SERIAL PRIMARY KEY)
- subject_id (INTEGER REFERENCES subjects(id))
- title (VARCHAR(255) NOT NULL)
- duration_minutes (INTEGER NOT NULL)
- started_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- score (INTEGER)
- max_score (INTEGER)

### test_questions
- id (SERIAL PRIMARY KEY)
- test_id (INTEGER REFERENCES mock_tests(id))
- question_id (INTEGER REFERENCES questions(id))
- user_answer (TEXT)
- is_correct (BOOLEAN)

### study_materials
- id (SERIAL PRIMARY KEY)
- subject_id (INTEGER REFERENCES subjects(id))
- title (VARCHAR(255) NOT NULL)
- content (TEXT NOT NULL)
- material_type (VARCHAR(50) NOT NULL) - 'notes', 'flashcards', 'summary'
- created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Setup Instructions

### 1. Create Supabase Project
1. Go to [https://app.supabase.io/](https://app.supabase.io/)
2. Create a new project
3. Note the Project URL and API Key (anon key)

### 2. Create Tables
1. In the Supabase dashboard, go to Table Editor
2. Create all the tables listed above with their respective schemas
3. Set up Row Level Security (RLS) policies as needed

### 3. Update Environment Variables
1. Copy [.env.example](file:///Users/sagar/Documents/gtu/.env.example) to [.env](file:///Users/sagar/Documents/gtu/.env.example)
2. Update SUPABASE_URL and SUPABASE_KEY with your project values
3. Update other API keys as needed (OpenAI, Bytez, etc.)

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Run the Application
```bash
python run_backend.py
```

## Remaining Tasks

### 1. Frontend Integration
- Update frontend to work with new API endpoints
- Test all components with Supabase backend

### 2. Supabase Storage
- Set up Supabase Storage for PDF files and other assets
- Update file upload/download functionality

### 3. Row Level Security
- Implement proper RLS policies for data security
- Set up user-specific data access rules

### 4. Testing
- Test all API endpoints with Supabase
- Verify authentication and authorization
- Test voice assistant and AI features

### 5. Documentation
- Update README with Supabase setup instructions
- Document API endpoints
- Create user guides

## Benefits of Supabase Integration

1. **Realtime Features**: Built-in realtime subscriptions
2. **Authentication**: Built-in user management and authentication
3. **Storage**: Integrated file storage solution
4. **Scalability**: Managed cloud infrastructure
5. **Development Speed**: Reduced backend development time
6. **Cost-Effective**: Generous free tier for small applications

## Migration Notes

If migrating from the previous PostgreSQL setup:
1. Export data from existing database
2. Transform data to match Supabase table schemas
3. Import data into Supabase tables
4. Update application configuration
5. Test thoroughly before deployment