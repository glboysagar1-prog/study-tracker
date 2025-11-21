-- Quick test: Verify RLS policies were applied correctly
-- Run this after applying fix_rls_policies.sql

-- Check if policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('notes', 'reference_materials', 'syllabus_content', 'material_sources')
ORDER BY tablename, policyname;

-- Expected output: You should see policies for:
-- notes: "Allow public inserts on notes" (INSERT)
-- notes: "Allow public updates on notes" (UPDATE)
-- notes: "Everyone can view notes" (SELECT)
-- reference_materials: "Allow public inserts on reference_materials" (INSERT)
-- reference_materials: "Allow public updates on reference_materials" (UPDATE)
-- reference_materials: "Everyone can view reference materials" (SELECT)
-- syllabus_content: "Allow public inserts on syllabus_content" (INSERT)
-- syllabus_content: "Everyone can view syllabus content" (SELECT)
-- material_sources: "Allow public inserts on material_sources" (INSERT)
-- material_sources: "Everyone can view material sources" (SELECT)
