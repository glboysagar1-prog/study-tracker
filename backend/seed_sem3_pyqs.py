import os
import sys
import re

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase

def seed_sem3_pyqs():
    print("Starting Sem 3 PYQ seeding...")
    
    # Authenticate to bypass RLS
    user_id = None
    try:
        email = "seeder@gtu.edu"
        password = "seederpassword123"
        auth_res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        user_id = auth_res.user.id
        print(f"Authenticated as seeder: {user_id}")
    except Exception as e:
        print(f"Auth failed: {e}. Proceeding anonymously (might fail if RLS is strict).")

    # 1. Define Subjects
    # Mapping based on filename prefixes
    # DBMSS/DBMSW -> DBMS (3130703)
    # DFS/DFW -> Digital Fundamentals (3130704)
    # DSS/DSW -> Data Structures (3130702)
    # ENGS/ENGW -> Effective Technical Communication (3130004) - Assumption based on common Sem 3 subjects
    # P&SS/P&SW -> Probability and Statistics (3130006)
    
    subjects = [
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "3", "subject_code": "3130703", "subject_name": "Database Management Systems", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "3", "subject_code": "3130702", "subject_name": "Data Structures", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "3", "subject_code": "3130704", "subject_name": "Digital Fundamentals", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "3", "subject_code": "3130004", "subject_name": "Effective Technical Communication", "credits": 3},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "3", "subject_code": "3130006", "subject_name": "Probability and Statistics", "credits": 5},
    ]
    
    subject_map = {
        "DBMS": "3130703",
        "DS": "3130702",
        "DF": "3130704",
        "ENG": "3130004",
        "P&S": "3130006"
    }
    
    created_subjects = {}
    
    print("\nSeeding Subjects...")
    for sub in subjects:
        try:
            existing = supabase.table("subjects").select("id").eq("subject_code", sub["subject_code"]).execute()
            if not existing.data:
                res = supabase.table("subjects").insert(sub).execute()
                if res.data:
                    created_subjects[sub["subject_code"]] = res.data[0]["id"]
                    print(f"Created subject: {sub['subject_name']}")
            else:
                created_subjects[sub["subject_code"]] = existing.data[0]["id"]
                print(f"Subject already exists: {sub['subject_name']}")
        except Exception as e:
            print(f"Error creating subject {sub['subject_name']}: {e}")

    # 2. Process Files
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "pyqs_sem3")
    if not os.path.exists(data_dir):
        print(f"Directory not found: {data_dir}")
        return

    files = os.listdir(data_dir)
    print(f"\nFound {len(files)} files in {data_dir}")
    
    for filename in files:
        if not filename.endswith(".pdf"):
            continue
            
        # Parse filename
        # Format: [Subject][S/W][Year].pdf
        # Examples: DBMSS2021.pdf, P&SW2022.pdf
        
        # Regex to extract parts
        match = re.match(r"([A-Z&]+)([SW])(\d{4})\.pdf", filename)
        if not match:
            print(f"Skipping invalid filename: {filename}")
            continue
            
        sub_prefix, season_code, year = match.groups()
        
        subject_code = subject_map.get(sub_prefix)
        if not subject_code:
            print(f"Unknown subject prefix: {sub_prefix} in {filename}")
            continue
            
        subject_id = created_subjects.get(subject_code)
        if not subject_id:
            # Try to fetch if it existed before script ran
            try:
                res = supabase.table("subjects").select("id").eq("subject_code", subject_code).execute()
                if res.data:
                    subject_id = res.data[0]["id"]
                    created_subjects[subject_code] = subject_id
            except:
                pass
        
        if not subject_id:
            print(f"Subject ID not found for {subject_code}")
            continue
            
        exam_type = "Summer" if season_code == "S" else "Winter"
        
        # Check if paper already exists
        try:
            existing = supabase.table("previous_papers").select("id")\
                .eq("subject_id", subject_id)\
                .eq("year", year)\
                .eq("exam_type", exam_type)\
                .execute()
                
            paper_url = f"http://localhost:5001/api/pdf/{filename}" # Local dev URL
            # In production, this should be relative or configured properly
            # For now, we store the relative path or a special marker that frontend handles?
            # Or better, store the full API URL. Since we are in dev, localhost is fine.
            # But wait, frontend uses relative paths in production.
            # Let's store a relative path if possible, or just the filename?
            # The current frontend expects a full URL.
            # Let's use a relative URL starting with /api/pdf/
            
            paper_url = f"/api/pdf/{filename}"
            
            paper_data = {
                "subject_id": subject_id,
                "year": year,
                "exam_type": exam_type,
                "paper_pdf_url": paper_url,
                "solution_pdf_url": "" # No solution files yet
            }
            
            if not existing.data:
                supabase.table("previous_papers").insert(paper_data).execute()
                print(f"Added paper: {filename} ({subject_code} {exam_type} {year})")
            else:
                # Update URL just in case
                supabase.table("previous_papers").update({"paper_pdf_url": paper_url})\
                    .eq("id", existing.data[0]["id"]).execute()
                print(f"Updated paper: {filename}")
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print("\nSem 3 PYQ seeding completed!")

if __name__ == "__main__":
    seed_sem3_pyqs()
