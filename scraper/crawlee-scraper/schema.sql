-- Database Schema for GTU Scraper Phase 1 & 2

-- Table for Exam Schedules
CREATE TABLE IF NOT EXISTS exam_schedules (
  id SERIAL PRIMARY KEY,
  exam_name VARCHAR(200),
  exam_date DATE,
  subject_code VARCHAR(50),
  time_slot VARCHAR(100),
  announcement_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Circulars and Notifications
CREATE TABLE IF NOT EXISTS circulars (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  content TEXT,
  circular_date DATE,
  pdf_url TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Question Banks (Phase 4, but good to have now)
CREATE TABLE IF NOT EXISTS question_banks (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(50),
  question_text TEXT,
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  difficulty VARCHAR(20),
  topic VARCHAR(200),
  source_name VARCHAR(100),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Video Resources (Phase 5)
CREATE TABLE IF NOT EXISTS video_resources (
  id SERIAL PRIMARY KEY,
  subject_code VARCHAR(50),
  title VARCHAR(500),
  description TEXT,
  video_url TEXT,
  duration INTEGER,
  platform VARCHAR(50),
  channel_name VARCHAR(200),
  transcript TEXT,
  views INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for GTU Results Statistics
CREATE TABLE IF NOT EXISTS result_statistics (
  id SERIAL PRIMARY KEY,
  exam_name VARCHAR(200),
  exam_date DATE,
  branch_code VARCHAR(10),
  semester INTEGER,
  total_students INTEGER,
  passed_students INTEGER,
  pass_percentage DECIMAL(5,2),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
