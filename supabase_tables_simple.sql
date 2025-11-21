-- Simplified SQL script to create tables for GTU Exam Preparation Application
-- Run this script in Supabase Dashboard → SQL Editor

-- Create users table
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
    question_type VARCHAR(20) NOT NULL,
    options JSONB,
    ai_explanation TEXT
);

-- Create previous_papers table
CREATE TABLE IF NOT EXISTS previous_papers (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    year VARCHAR(10) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
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
    material_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create gtu_updates table for storing GTU circulars, news, and exam schedules
CREATE TABLE IF NOT EXISTS gtu_updates (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    link_url TEXT,
    content_hash VARCHAR(64) UNIQUE NOT NULL,
    is_latest BOOLEAN DEFAULT TRUE,
    scraped_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries on gtu_updates
CREATE INDEX IF NOT EXISTS idx_gtu_updates_category ON gtu_updates(category);
CREATE INDEX IF NOT EXISTS idx_gtu_updates_date ON gtu_updates(date DESC);
CREATE INDEX IF NOT EXISTS idx_gtu_updates_latest ON gtu_updates(is_latest);
CREATE INDEX IF NOT EXISTS idx_gtu_updates_content_hash ON gtu_updates(content_hash);

-- Confirm tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';