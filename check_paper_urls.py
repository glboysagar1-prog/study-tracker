import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

def check_urls():
    # Get a subject first
    subjects = supabase.table("subjects").select("*").limit(1).execute()
    if not subjects.data:
        print("No subjects found")
        return

    subject_id = subjects.data[0]['id']
    print(f"Checking papers for subject ID: {subject_id}")

    # Get papers
    papers = supabase.table("previous_papers").select("*").eq("subject_id", subject_id).execute()
    
    if not papers.data:
        print("No papers found for this subject")
        
        # Try to find any paper
        all_papers = supabase.table("previous_papers").select("*").limit(5).execute()
        if all_papers.data:
            print("\nFound other papers:")
            for p in all_papers.data:
                print(f"ID: {p['id']}, PDF: {p.get('paper_pdf_url')}")
        else:
            print("No papers found in database at all")
        return

    for p in papers.data:
        print(f"ID: {p['id']}, Year: {p['year']}, PDF URL: {p.get('paper_pdf_url')}")

if __name__ == "__main__":
    check_urls()
