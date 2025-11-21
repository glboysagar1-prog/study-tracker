-- Fix Row Level Security policies to allow inserts
-- PostgreSQL doesn't support IF NOT EXISTS for CREATE POLICY
-- So we drop existing policies first, then create new ones

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public inserts on notes" ON notes;
DROP POLICY IF EXISTS "Allow public inserts on reference_materials" ON reference_materials;
DROP POLICY IF EXISTS "Allow public inserts on syllabus_content" ON syllabus_content;
DROP POLICY IF EXISTS "Allow public inserts on material_sources" ON material_sources;
DROP POLICY IF EXISTS "Allow public updates on notes" ON notes;
DROP POLICY IF EXISTS "Allow public updates on reference_materials" ON reference_materials;

-- Notes table - allow everyone to insert (for testing/scrapers)
CREATE POLICY "Allow public inserts on notes" ON notes
    FOR INSERT WITH CHECK (true);

-- Reference materials table - allow everyone to insert  
CREATE POLICY "Allow public inserts on reference_materials" ON reference_materials
    FOR INSERT WITH CHECK (true);

-- Syllabus content table - allow everyone to insert
CREATE POLICY "Allow public inserts on syllabus_content" ON syllabus_content
    FOR INSERT WITH CHECK (true);

-- Material sources table - allow everyone to insert
CREATE POLICY "Allow public inserts on material_sources" ON material_sources
    FOR INSERT WITH CHECK (true);

-- Also allow updates for download/view counts
CREATE POLICY "Allow public updates on notes" ON notes
    FOR UPDATE USING (true);

CREATE POLICY "Allow public updates on reference_materials" ON reference_materials
    FOR UPDATE USING (true);

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'RLS policies successfully created for notes, reference_materials, syllabus_content, and material_sources tables';
END $$;

-- If you want more restrictive policies later, you can:
-- 1. Require authentication: WITH CHECK (auth.uid() IS NOT NULL)
-- 2. Require specific roles: WITH CHECK (auth.jwt() ->> 'role' = 'admin')
-- 3. Only allow scraper service account
