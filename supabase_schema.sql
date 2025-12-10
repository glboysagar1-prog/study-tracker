-- SQL script to create tables for GTU Exam Preparation Application

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128),
    college VARCHAR(100),
    branch VARCHAR(100),
    semester VARCHAR(10),
    ai_credits INTEGER DEFAULT 200,
    total_ai_requests INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    course VARCHAR(100) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL
);

-- Create syllabus table
CREATE TABLE IF NOT EXISTS syllabus (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    unit_number INTEGER NOT NULL,
    unit_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL
);

-- Create questions table
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

-- Create previous_papers table
CREATE TABLE IF NOT EXISTS previous_papers (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    year VARCHAR(10) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,  -- 'Regular', 'Re-exam', etc.
    paper_pdf_url TEXT,
    solution_pdf_url TEXT
);

-- Create mock_tests table
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

-- Create test_questions table
CREATE TABLE IF NOT EXISTS test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES mock_tests(id),
    question_id INTEGER REFERENCES questions(id),
    user_answer TEXT,
    is_correct BOOLEAN
);

-- Create study_materials table
CREATE TABLE IF NOT EXISTS study_materials (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    material_type VARCHAR(50) NOT NULL,  -- 'notes', 'flashcards', 'summary'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE previous_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for users table (example - adjust as needed)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Create policies for other tables (examples - adjust as needed)
CREATE POLICY "Everyone can view subjects" ON subjects
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view syllabus" ON syllabus
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view questions" ON questions
    FOR SELECT USING (true);

-- Note: You'll need to create more specific policies based on your application's requirements