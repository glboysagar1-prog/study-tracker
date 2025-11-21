"""
Verify that the comprehensive study material schema has been applied successfully
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL and SUPABASE_KEY environment variables required")
    exit(1)

supabase = create_client(url, key)

print("Verifying comprehensive study material schema...")
print("="*60)

# Tables to check
tables_to_check = [
    'material_sources',
    'notes',
    'syllabus_content',
    'reference_materials',
    'important_questions',
    'study_materials'
]

all_passed = True

for table_name in tables_to_check:
    try:
        # Try to query the table
        response = supabase.table(table_name).select("*").limit(1).execute()
        print(f"✓ Table '{table_name}' exists and is accessible")
    except Exception as e:
        print(f"✗ Table '{table_name}' check failed: {str(e)}")
        all_passed = False

print("\n" + "="*60)

# Check specific columns in new tables
print("\nChecking column structure...")

# Check notes table columns
try:
    response = supabase.table("notes").select(
        "subject_code,unit,title,source_url,source_name,content_hash"
    ).limit(1).execute()
    print("✓ Notes table has required columns")
except Exception as e:
    print(f"✗ Notes table column check failed: {str(e)}")
    all_passed = False

# Check reference_materials table columns
try:
    response = supabase.table("reference_materials").select(
        "subject_code,material_type,title,url,source_url"
    ).limit(1).execute()
    print("✓ Reference materials table has required columns")
except Exception as e:
    print(f"✗ Reference materials table column check failed: {str(e)}")
    all_passed = False

# Check syllabus_content table columns
try:
    response = supabase.table("syllabus_content").select(
        "subject_code,unit,topic,content,source_url"
    ).limit(1).execute()
    print("✓ Syllabus content table has required columns")
except Exception as e:
    print(f"✗ Syllabus content table column check failed: {str(e)}")
    all_passed = False

# Check material_sources table
try:
    response = supabase.table("material_sources").select("*").execute()
    sources = response.data if response.data else []
    print(f"✓ Material sources table exists with {len(sources)} sources")
    for source in sources:
        print(f"  - {source.get('source_name')}: {source.get('base_url')}")
except Exception as e:
    print(f"✗ Material sources check failed: {str(e)}")
    all_passed = False

# Check updated study_materials columns
try:
    response = supabase.table("study_materials").select(
        "source_url,source_name,unit,content_hash"
    ).limit(1).execute()
    print("✓ Study materials table has new attribution columns")
except Exception as e:
    print(f"✗ Study materials attribution columns check failed: {str(e)}")
    all_passed = False

# Check updated important_questions columns
try:
    response = supabase.table("important_questions").select(
        "source_url,source_name,answer_text"
    ).limit(1).execute()
    print("✓ Important questions table has new attribution columns")
except Exception as e:
    print(f"✗ Important questions attribution columns check failed: {str(e)}")
    all_passed = False

print("\n" + "="*60)

if all_passed:
    print("✓ Schema verification PASSED - All tables and columns exist!")
    print("\nYou can now proceed with:")
    print("1. Implementing Scrapy spiders")
    print("2. Adding backend API endpoints")
    print("3. Creating frontend components")
else:
    print("✗ Schema verification FAILED - Please check the errors above")
    print("\nPlease apply the schema using:")
    print("  backend/db/comprehensive_study_material_schema.sql")

print("="*60)
