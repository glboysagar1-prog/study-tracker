-- Comprehensive Study Material Schema

-- Drop existing study_materials if it exists to recreate with new columns or alter it
-- For safety, we will use CREATE IF NOT EXISTS and ALTER for existing tables, 
-- but since this is a dev environment and we want the full schema, let's define the full structure.

-- Study materials table (Enhanced)
CREATE TABLE IF NOT EXISTS study_materials (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50),
    semester INTEGER,
    branch VARCHAR(100),
    material_type VARCHAR(50), -- 'notes', 'video', 'book', 'lab', 'ppt'
    title VARCHAR(255),
    description TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    unit INTEGER,
    topic VARCHAR(255),
    author VARCHAR(100),
    uploaded_by UUID, -- Changed to UUID to match Supabase auth.users usually
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    views INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subject_id INTEGER -- Optional FK to subjects table if needed
);

-- Video playlists
CREATE TABLE IF NOT EXISTS video_playlists (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50),
    playlist_name VARCHAR(255),
    youtube_playlist_url TEXT,
    channel_name VARCHAR(100),
    total_videos INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Important questions (Enhanced)
CREATE TABLE IF NOT EXISTS important_questions (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50),
    unit INTEGER,
    question_text TEXT,
    marks INTEGER,
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    frequency INTEGER, -- How often it appears in exams
    last_asked_year INTEGER,
    answer_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab programs
CREATE TABLE IF NOT EXISTS lab_programs (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50),
    practical_number INTEGER,
    program_title VARCHAR(255),
    aim TEXT,
    code TEXT,
    output TEXT,
    viva_questions TEXT[],
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User bookmarks
CREATE TABLE IF NOT EXISTS bookmarked_materials (
    id SERIAL PRIMARY KEY,
    user_id UUID, -- Changed to UUID
    material_id INTEGER REFERENCES study_materials(id),
    bookmarked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User downloads tracking
CREATE TABLE IF NOT EXISTS user_downloads (
    id SERIAL PRIMARY KEY,
    user_id UUID,
    material_id INTEGER REFERENCES study_materials(id),
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material ratings
CREATE TABLE IF NOT EXISTS material_ratings (
    id SERIAL PRIMARY KEY,
    material_id INTEGER REFERENCES study_materials(id),
    user_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(material_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_materials_subject_code ON study_materials(subject_code);
CREATE INDEX IF NOT EXISTS idx_study_materials_type ON study_materials(material_type);
CREATE INDEX IF NOT EXISTS idx_important_questions_subject_code ON important_questions(subject_code);
CREATE INDEX IF NOT EXISTS idx_lab_programs_subject_code ON lab_programs(subject_code);
