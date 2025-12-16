
import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def list_content():
    print("="*60)
    print("SCRAPED CONTENT REPORT")
    print("="*60)

    try:
        # 1. List Papers
        print("\n📄 PREVIOUS YEAR PAPERS & SOLUTIONS")
        print("-" * 60)
        papers = supabase.table("previous_papers").select("year, exam_type, subject_id, paper_pdf_url, solution_pdf_url").execute()
        
        if not papers.data:
            print("No papers found.")
        else:
            # Get subject codes mapping if possible, but let's just list what we have
            # Optimization: Fetch subjects to map IDs
            subjects_resp = supabase.table("subjects").select("id, subject_code").execute()
            sub_map = {s['id']: s['subject_code'] for s in subjects_resp.data}

            for p in papers.data[:20]: # Limit to 20 for readability
                sub_code = sub_map.get(p['subject_id'], 'Unknown')
                has_sol = "✅ Solution" if p['solution_pdf_url'] else "❌ No Sol"
                print(f"[{sub_code}] {p['year']} {p['exam_type']} - Paper: {p['paper_pdf_url'] is not None} | {has_sol}")
            
            if len(papers.data) > 20:
                print(f"... and {len(papers.data) - 20} more papers.")

        # 2. List Notes/Materials
        print("\n📚 STUDY NOTES & MATERIALS")
        print("-" * 60)
        notes = supabase.table("notes").select("title, subject_code, file_url, description").limit(20).execute()
        
        if not notes.data:
            print("No notes found.")
        else:
            for n in notes.data:
                print(f"[{n['subject_code']}] {n['title']}")
                print(f"   URL: {n['file_url']}")
                print(f"   Desc: {n['description'][:50]}...")
                print("-" * 20)
            
            # Get total count
            count = supabase.table("notes").select("id", count="exact").execute()
            if count.count > 20:
                print(f"... showing 20 of {count.count} total notes.")

    except Exception as e:
        print(f"Error fetching data: {e}")

if __name__ == "__main__":
    list_content()
