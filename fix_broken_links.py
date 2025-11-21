"""
Fix broken PDF links in database
Replaces broken GTU Study links with AI-generated PDFs
"""
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

# Mapping of broken URLs to new local backend URLs
updates = [
    {
        "id": 14,
        "title": "Introduction to Data Structures (AI Guide)",
        "file_url": "http://localhost:5004/api/pdf/2140701_Unit1_AI.pdf",
        "description": "AI-generated study guide for Unit 1"
    },
    {
        "id": 15,
        "title": "Arrays and Stacks (AI Guide)",
        "file_url": "http://localhost:5004/api/pdf/2140701_Unit2_AI.pdf",
        "description": "AI-generated study guide for Unit 2"
    }
]

print("Fixing broken PDF links...")

for update in updates:
    data = {
        "title": update["title"],
        "file_url": update["file_url"],
        "description": update["description"]
    }
    
    try:
        supabase.table('notes').update(data).eq('id', update['id']).execute()
        print(f"✓ Fixed note ID {update['id']}")
    except Exception as e:
        print(f"✗ Error updating ID {update['id']}: {e}")

print("\nDone! Broken links replaced with working AI PDFs.")
