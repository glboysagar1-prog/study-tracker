-- Comprehensive Study Material Aggregation Schema
-- This schema supports scraping and organizing materials from multiple sources
-- with proper attribution and advanced filtering capabilities

-- Material sources tracking table
CREATE TABLE IF NOT EXISTS material_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL,
    base_url TEXT NOT NULL,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    scrape_frequency VARCHAR(20) DEFAULT 'weekly', -- daily, weekly, monthly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table - Unit-wise notes with source attribution
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    unit INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT, -- Direct download link or link to external page
    source_url TEXT NOT NULL, -- Original page where this was found
    source_name VARCHAR(100), -- e.g., 'GTUStudy', 'GTUMaterial'
    content_hash VARCHAR(64) UNIQUE, -- To prevent duplicates
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced syllabus content table - Topic-level detail
CREATE TABLE IF NOT EXISTS syllabus_content (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    unit INTEGER NOT NULL,
    unit_title VARCHAR(255),
    topic VARCHAR(255),
    content TEXT,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reference materials table - Books, PDFs, Videos, External Resources
CREATE TABLE IF NOT EXISTS reference_materials (
    id SERIAL PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(255),
    material_type VARCHAR(50) NOT NULL, -- 'book', 'pdf', 'video', 'link', 'article'
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    source_url TEXT, -- Where we found this reference
    source_name VARCHAR(100),
    isbn VARCHAR(20), -- For books
    publisher VARCHAR(255), -- For books
    year INTEGER,
    rating DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update important_questions table (alter existing)
-- Add source attribution fields
DO $$ 
BEGIN
    -- Add source_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'important_questions' AND column_name = 'source_url'
    ) THEN
        ALTER TABLE important_questions ADD COLUMN source_url TEXT;
    END IF;
    
    -- Add source_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'important_questions' AND column_name = 'source_name'
    ) THEN
        ALTER TABLE important_questions ADD COLUMN source_name VARCHAR(100);
    END IF;
    
    -- Add answer_text if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'important_questions' AND column_name = 'answer_text'
    ) THEN
        ALTER TABLE important_questions ADD COLUMN answer_text TEXT;
    END IF;
END $$;

-- Update study_materials table (alter existing)
-- Add source attribution and unit fields
DO $$ 
BEGIN
    -- Add source_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'study_materials' AND column_name = 'source_url'
    ) THEN
        ALTER TABLE study_materials ADD COLUMN source_url TEXT;
    END IF;
    
    -- Add source_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'study_materials' AND column_name = 'source_name'
    ) THEN
        ALTER TABLE study_materials ADD COLUMN source_name VARCHAR(100);
    END IF;
    
    -- Add unit if it doesn't exist and if the column structure allows
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'study_materials' AND column_name = 'unit'
    ) THEN
        ALTER TABLE study_materials ADD COLUMN unit INTEGER;
    END IF;
    
    -- Add content_hash if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'study_materials' AND column_name = 'content_hash'
    ) THEN
        ALTER TABLE study_materials ADD COLUMN content_hash VARCHAR(64);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_subject_code ON notes(subject_code);
CREATE INDEX IF NOT EXISTS idx_notes_unit ON notes(unit);
CREATE INDEX IF NOT EXISTS idx_notes_source_name ON notes(source_name);
CREATE INDEX IF NOT EXISTS idx_notes_content_hash ON notes(content_hash);

CREATE INDEX IF NOT EXISTS idx_syllabus_content_subject_code ON syllabus_content(subject_code);
CREATE INDEX IF NOT EXISTS idx_syllabus_content_unit ON syllabus_content(unit);

CREATE INDEX IF NOT EXISTS idx_reference_materials_subject_code ON reference_materials(subject_code);
CREATE INDEX IF NOT EXISTS idx_reference_materials_type ON reference_materials(material_type);

CREATE INDEX IF NOT EXISTS idx_material_sources_active ON material_sources(is_active);

-- Insert default material sources
INSERT INTO material_sources (source_name, base_url, scrape_frequency) VALUES
    ('GTUStudy', 'https://www.gtustudy.com', 'weekly'),
    ('GTUMaterial', 'https://www.gtumaterial.com', 'weekly'),
    ('Darshan Institute', 'https://www.darshan.ac.in', 'monthly')
ON CONFLICT (source_name) DO NOTHING;

-- Enable Row Level Security for new tables
ALTER TABLE material_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Everyone can view material sources" ON material_sources
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view notes" ON notes
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view syllabus content" ON syllabus_content
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view reference materials" ON reference_materials
    FOR SELECT USING (true);
