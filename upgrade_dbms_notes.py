"""
Upgrade DBMS notes to use GPT-4o AI Study Guide
Replaces dummy links with high-quality AI-generated content
"""
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Mapping of dummy notes to new AI PDF
updates = [
    {
        "id": 9,
        "title": "Introduction to DBMS (GPT-4o Guide)",
        "file_url": "http://localhost:5004/api/pdf/3140703_GPT4o_Study_Guide.pdf",
        "description": "Comprehensive AI-generated study guide for Unit 1 & 2"
    },
    {
        "id": 10,
        "title": "Relational Model & SQL (GPT-4o Guide)",
        "file_url": "http://localhost:5004/api/pdf/3140703_GPT4o_Study_Guide.pdf",
        "description": "Comprehensive AI-generated study guide for Unit 1 & 2"
    }
]

print("Upgrading DBMS notes to AI content...")

for update in updates:
    data = {
        "title": update["title"],
        "file_url": update["file_url"],
        "description": update["description"]
    }
    
    try:
        supabase.table('notes').update(data).eq('id', update['id']).execute()
        print(f"✓ Upgraded note ID {update['id']}")
    except Exception as e:
        print(f"✗ Error updating ID {update['id']}: {e}")

print("\nDone! DBMS notes upgraded to GPT-4o content.")
