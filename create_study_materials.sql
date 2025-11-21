CREATE TABLE IF NOT EXISTS study_materials (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id),
    title VARCHAR(255) NOT NULL,
    content TEXT, -- URL or text content
    material_type VARCHAR(50) DEFAULT 'notes', -- notes, video, book
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_study_materials_subject_id ON study_materials(subject_id);
