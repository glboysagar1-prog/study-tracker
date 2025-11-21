# Supabase Database Setup - Create Tables

## Steps to Create Database Tables

1. **Access Supabase Dashboard**:
   - Open your web browser
   - Go to: https://phhrwkcqmuktajuuswza.supabase.co
   - Sign in to your Supabase account

2. **Navigate to SQL Editor**:
   - In the left sidebar, click on "SQL Editor"
   - You'll see the SQL query interface with a code editor

3. **Run the SQL Script**:
   - Open the file `supabase_tables_simple.sql` from your project
   - Copy the entire content of the file
   - Paste it into the SQL Editor in Supabase Dashboard
   - Click the "Run" button to execute the script

4. **Verify Table Creation**:
   - After running the script, you should see a success message
   - To verify the tables were created, check the "Table Editor" section in the left sidebar

## SQL Script Location

The SQL script is located at:
`/Users/sagar/Documents/gtu/supabase_tables_simple.sql`

This script creates all the necessary tables for the GTU Exam Preparation Application:
- users
- subjects
- syllabus
- questions
- previous_papers
- mock_tests
- test_questions
- study_materials

## Next Steps

After creating the tables:
1. Configure Row Level Security (RLS) policies as needed
2. Test the connection with `python3 test_supabase.py`
3. Insert sample data with `python3 test_data_insert.py`