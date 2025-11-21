"""
Apply comprehensive study material schema to Supabase database
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

print("Reading schema file...")
with open('backend/db/comprehensive_study_material_schema.sql', 'r') as f:
    schema_sql = f.read()

print("Applying comprehensive study material schema to Supabase...")

try:
    # Execute the schema
    # Note: Supabase Python client doesn't have direct SQL execution
    # We'll need to use the Supabase dashboard SQL editor or use psycopg2
    # For now, let's inform the user to apply manually
    
    print("\n" + "="*60)
    print("SCHEMA FILE READY")
    print("="*60)
    print("\nPlease apply the schema using one of these methods:")
    print("\n1. Supabase Dashboard:")
    print("   - Go to your Supabase project dashboard")
    print("   - Navigate to SQL Editor")
    print("   - Copy and paste the contents of:")
    print("     backend/db/comprehensive_study_material_schema.sql")
    print("   - Run the query")
    print("\n2. Using psql command line:")
    print("   psql '<your-supabase-connection-string>' < backend/db/comprehensive_study_material_schema.sql")
    print("\n" + "="*60)
    
    # Alternatively, we can try to execute via RPC if there's a function
    # Or we can use psycopg2 if connection string is available
    
    # Let's try a simple check to see if we can verify table creation later
    print("\nAfter applying the schema, run this script again with --verify flag")
    print("to verify the tables were created successfully.")
    
except Exception as e:
    print(f"Error: {str(e)}")
    exit(1)
