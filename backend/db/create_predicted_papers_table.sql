-- Create table for storing predicted semester papers
CREATE TABLE IF NOT EXISTS predicted_papers (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    paper_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subject_id)
);

-- Enable RLS
ALTER TABLE predicted_papers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Everyone can view predicted papers" ON predicted_papers
    FOR SELECT USING (true);

-- Allow public insert (for the agent to save) - In prod we might restrict this
CREATE POLICY "Everyone can insert predicted papers" ON predicted_papers
    FOR INSERT WITH CHECK (true);
