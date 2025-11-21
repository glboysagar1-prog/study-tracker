-- Update questions table for GTU specific features

-- Add columns for Important Questions feature
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT FALSE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS frequency_count INTEGER DEFAULT 0;

-- Add columns for GTU Exam Pattern
ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'Medium'; -- Easy, Medium, Hard
ALTER TABLE questions ADD COLUMN IF NOT EXISTS gtu_section VARCHAR(20); -- Q1, Q2, Q3, Q4, Q5

-- Update mock_tests table to store the generated paper structure
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS paper_structure JSONB; 

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_is_important ON questions(is_important);
CREATE INDEX IF NOT EXISTS idx_questions_marks ON questions(marks);
