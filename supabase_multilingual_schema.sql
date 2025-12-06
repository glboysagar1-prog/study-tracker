-- Multilingual Content Schema for GTU App
-- Supports IndicLLM translations and self-improvement loops

-- Table 1: Multilingual content storage with caching
CREATE TABLE IF NOT EXISTS multilingual_content (
  id SERIAL PRIMARY KEY,
  content_id INTEGER REFERENCES study_materials(id) ON DELETE CASCADE,
  content_hash VARCHAR(32),  -- MD5 hash for deduplication
  content_type VARCHAR(50) DEFAULT 'study_material',  -- study_material, question, flashcard
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  source_language VARCHAR(10) DEFAULT 'en',
  language_code VARCHAR(10) NOT NULL,
  translation_method VARCHAR(50),  -- 'mlx-local', 'gpt4o', 'manual'
  quality_score DECIMAL(3,2) DEFAULT 0.80,  -- 0.00 to 1.00
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Indexing for fast lookups
  UNIQUE(content_hash, source_language, language_code)
);

CREATE INDEX idx_multilingual_content_id ON multilingual_content(content_id);
CREATE INDEX idx_multilingual_lang ON multilingual_content(language_code);
CREATE INDEX idx_multilingual_hash ON multilingual_content(content_hash);

-- Table 2: Enhanced user feedback for self-improvement
CREATE TABLE IF NOT EXISTS user_feedback_detailed (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  content_id INTEGER,
  content_type VARCHAR(50),  -- 'note', 'quiz', 'flashcard', 'explanation'
  content_variant_id VARCHAR(50),  -- For A/B testing different versions
  
  -- Multi-dimensional ratings (1-5 scale)
  clarity_rating INTEGER CHECK (clarity_rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  
  -- Engagement metrics
  time_spent_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  upvoted BOOLEAN DEFAULT FALSE,
  
  -- Qualitative feedback
  comment TEXT,
  reported_issue BOOLEAN DEFAULT FALSE,
  issue_type VARCHAR(50),  -- 'translation_error', 'factual_error', 'unclear'
  
  -- Context
  language_code VARCHAR(10) DEFAULT 'en',
  device_type VARCHAR(20),  -- 'mobile', 'desktop', 'tablet'
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_content ON user_feedback_detailed(content_id);
CREATE INDEX idx_feedback_variant ON user_feedback_detailed(content_variant_id);
CREATE INDEX idx_feedback_user ON user_feedback_detailed(user_id);

-- Table 3: Content experiments (A/B testing for self-improvement)
CREATE TABLE IF NOT EXISTS content_experiments (
  id SERIAL PRIMARY KEY,
  experiment_name VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL,  -- 'study_note', 'quiz', 'explanation'
  topic VARCHAR(200),
  
  -- Variants being tested
  variant_a_id VARCHAR(50) NOT NULL,
  variant_b_id VARCHAR(50) NOT NULL,
  variant_a_prompt TEXT,  -- The prompt/template used for variant A
  variant_b_prompt TEXT,  -- The prompt/template used for variant B
  
  -- Performance metrics
  variant_a_impressions INTEGER DEFAULT 0,
  variant_b_impressions INTEGER DEFAULT 0,
  variant_a_score DECIMAL(5,2) DEFAULT 0,  -- Average rating
  variant_b_score DECIMAL(5,2) DEFAULT 0,
  variant_a_engagement DECIMAL(5,2) DEFAULT 0,  -- Time spent / completion rate
  variant_b_engagement DECIMAL(5,2) DEFAULT 0,
  
  -- Statistical significance
  sample_size INTEGER DEFAULT 0,
  p_value DECIMAL(5,4),  -- Statistical significance
  confidence_interval TEXT,  -- JSON: {"lower": 0.1, "upper": 0.3}
  
  -- Results
  winner VARCHAR(10),  -- 'A', 'B', 'TIE', or NULL if ongoing
  improvement_percentage DECIMAL(5,2),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'completed', 'archived'
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_experiments_status ON content_experiments(status);
CREATE INDEX idx_experiments_topic ON content_experiments(topic);

-- Table 4: User language preferences
CREATE TABLE IF NOT EXISTS user_language_preferences (
  user_id UUID PRIMARY KEY,
  primary_language VARCHAR(10) DEFAULT 'en',
  secondary_languages TEXT[],  -- Array of language codes
  auto_translate BOOLEAN DEFAULT FALSE,
  
  -- Personalization
  preferred_content_style VARCHAR(20),  -- 'detailed', 'concise', 'visual'
  difficulty_preference VARCHAR(20),  -- 'beginner', 'intermediate', 'advanced'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table 5: Model improvement log (SEAL-style tracking)
CREATE TABLE IF NOT EXISTS model_improvements (
  id SERIAL PRIMARY KEY,
  improvement_type VARCHAR(50) NOT NULL,  -- 'prompt_optimization', 'template_update', 'hyperparameter_change'
  
  -- What changed
  component VARCHAR(100),  -- Which part of the system
  before_value TEXT,
  after_value TEXT,
  change_description TEXT,
  
  -- Why it changed
  triggered_by VARCHAR(50),  -- 'low_ratings', 'user_feedback', 'experiment_result'
  evidence TEXT,  -- JSON with supporting data
  
  -- Impact metrics
  baseline_score DECIMAL(5,2),
  new_score DECIMAL(5,2),
  improvement_delta DECIMAL(5,2),
  sample_size INTEGER,
  
  -- Deployment
  status VARCHAR(20) DEFAULT 'proposed',  -- 'proposed', 'testing', 'deployed', 'rolled_back'
  deployed_at TIMESTAMP,
  rollback_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'self_improvement_agent'
);

CREATE INDEX idx_improvements_component ON model_improvements(component);
CREATE INDEX idx_improvements_status ON model_improvements(status);

-- Table 6: Video summaries (supporting feature)
CREATE TABLE IF NOT EXISTS video_summaries (
  id SERIAL PRIMARY KEY,
  video_url TEXT NOT NULL,
  video_id VARCHAR(50) NOT NULL,
  platform VARCHAR(20) DEFAULT 'youtube',
  
  -- Summary content
  summary TEXT NOT NULL,
  key_topics TEXT[],
  timestamps TEXT,  -- JSON: [{"time": "1:20", "topic": "Intro"}]
  
  -- Multilingual summaries
  language_code VARCHAR(10) DEFAULT 'en',
  
  -- Metadata
  duration_seconds INTEGER,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(video_id, language_code)
);

CREATE INDEX idx_video_summaries_url ON video_summaries(video_id);

-- Table 7: Flashcards (supporting feature)
CREATE TABLE IF NOT EXISTS flashcards (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(200) NOT NULL,
  subject_code VARCHAR(20),
  
  -- Card content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'medium',
  
  -- Multilingual support
  language_code VARCHAR(10) DEFAULT 'en',
  
  -- Spaced repetition metadata
  next_review_date DATE,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  
  -- User engagement
  times_viewed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_flashcards_topic ON flashcards(topic);
CREATE INDEX idx_flashcards_subject ON flashcards(subject_code);
CREATE INDEX idx_flashcards_lang ON flashcards(language_code);

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE multilingual_content IS 'Stores translations of study materials in 22+ Indic languages';
COMMENT ON TABLE user_feedback_detailed IS 'Enhanced feedback for SEAL-style self-improvement loops';
COMMENT ON TABLE content_experiments IS 'A/B testing experiments to identify best content variants';
COMMENT ON TABLE user_language_preferences IS 'User preferences for language and content style';
COMMENT ON TABLE model_improvements IS 'Tracks self-improvement changes and their impact';
COMMENT ON TABLE video_summaries IS 'AI-generated summaries of educational videos';
COMMENT ON TABLE flashcards IS 'AI-generated flashcards for spaced repetition learning';

-- Sample query examples:

-- Get all translations for a specific content item
-- SELECT * FROM multilingual_content WHERE content_id = 123;

-- Get user's preferred language
-- SELECT primary_language FROM user_language_preferences WHERE user_id = 'uuid';

-- Find winning experiment variants
-- SELECT * FROM content_experiments WHERE winner IS NOT NULL AND status = 'completed';

-- Get average ratings by language
-- SELECT language_code, AVG(overall_rating) as avg_rating 
-- FROM user_feedback_detailed 
-- GROUP BY language_code;
