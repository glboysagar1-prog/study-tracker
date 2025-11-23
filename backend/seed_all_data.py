import os
import sys
from datetime import datetime

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.supabase_client import supabase

def seed_data():
    print("Starting data seeding...")

    # 1. Subjects
    subjects = [
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "6", "subject_code": "3160704", "subject_name": "Theory of Computation", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "6", "subject_code": "3160714", "subject_name": "Data Mining", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "6", "subject_code": "3160707", "subject_name": "Advanced Java", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "6", "subject_code": "3160712", "subject_name": "Microprocessor and Interfacing", "credits": 5},
        {"course": "B.E.", "branch": "Computer Engineering", "semester": "6", "subject_code": "3160713", "subject_name": "Web Programming", "credits": 5},
        {"course": "B.E.", "branch": "Information Technology", "semester": "6", "subject_code": "3161606", "subject_name": "Cryptography and Network Security", "credits": 5},
    ]
    
    created_subjects = {}
    
    print("Seeding Subjects...")
    for sub in subjects:
        try:
            # Check if exists
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

    # 2. Syllabus & Syllabus Content
    print("\nSeeding Syllabus...")
    toc_id = created_subjects.get("3160704")
    if toc_id:
        syllabus_items = [
            {"subject_id": toc_id, "unit_number": 1, "unit_title": "Introduction", "content": "Basic concepts, Strings, Alphabets, Languages"},
            {"subject_id": toc_id, "unit_number": 2, "unit_title": "Regular Languages", "content": "Finite Automata, Regular Expressions, Pumping Lemma"},
            {"subject_id": toc_id, "unit_number": 3, "unit_title": "Context Free Languages", "content": "CFG, PDA, CNF, GNF"},
        ]
        for item in syllabus_items:
            try:
                supabase.table("syllabus").insert(item).execute()
            except Exception as e:
                print(f"Error seeding syllabus: {e}")

    # 3. Lab Programs
    print("\nSeeding Lab Programs...")
    lab_programs = [
        {
            "subject_code": "3160713", # Web Programming
            "practical_number": 1,
            "title": "HTML Basics",
            "aim": "Create a simple webpage using HTML5 structure elements.",
            "code": "<!DOCTYPE html>\n<html>\n<head><title>My Page</title></head>\n<body>\n<h1>Hello World</h1>\n<p>This is a paragraph.</p>\n</body>\n</html>",
            "output": "Displays a heading and a paragraph.",
            "viva_questions": ["What is DOCTYPE?", "Difference between div and span?"]
        },
        {
            "subject_code": "3160707", # Advanced Java
            "practical_number": 1,
            "title": "JDBC Connection",
            "aim": "Write a program to connect to a database using JDBC.",
            "code": "import java.sql.*;\nclass DBConnect {\n  public static void main(String args[]) {\n    try {\n      Class.forName(\"com.mysql.jdbc.Driver\");\n      Connection con = DriverManager.getConnection(\"jdbc:mysql://localhost:3306/sonoo\",\"root\",\"root\");\n      // ...\n    } catch(Exception e){ System.out.println(e);}\n  }\n}",
            "output": "Connection established successfully.",
            "viva_questions": ["What are the steps to connect to DB?", "Types of JDBC drivers?"]
        }
    ]
    for prog in lab_programs:
        try:
            supabase.table("lab_programs").insert(prog).execute()
        except Exception as e:
            print(f"Error seeding lab program: {e}")

    # 4. Video Playlists
    print("\nSeeding Video Playlists...")
    playlists = [
        {
            "subject_code": "3160704",
            "title": "Theory of Computation Full Course",
            "playlist_id": "PLBlnK6fEyqRgp46ZLvXl95v42Ks45yHg_",
            "description": "Complete TOC lectures by Neso Academy",
            "thumbnail_url": "https://i.ytimg.com/vi/58N2N7zJGrQ/hqdefault.jpg"
        },
        {
            "subject_code": "3160714",
            "title": "Data Mining Tutorials",
            "playlist_id": "PLLGywfVR_Gy1K8N5k7D-2Qf-M_W8S-0hQ",
            "description": "Data Mining and Warehousing concepts",
            "thumbnail_url": "https://i.ytimg.com/vi/jEUUqjTq3H0/hqdefault.jpg"
        }
    ]
    for pl in playlists:
        try:
            supabase.table("video_playlists").insert(pl).execute()
        except Exception as e:
            print(f"Error seeding playlist: {e}")

    # 5. Important Questions
    print("\nSeeding Important Questions...")
    if toc_id:
        questions = [
            {"subject_id": toc_id, "unit_number": 1, "question_text": "Define Finite Automata.", "marks": 3, "question_type": "Short", "is_important": True, "frequency_count": 5},
            {"subject_id": toc_id, "unit_number": 2, "question_text": "Explain Pumping Lemma for Regular Languages with example.", "marks": 7, "question_type": "Long", "is_important": True, "frequency_count": 8},
            {"subject_id": toc_id, "unit_number": 3, "question_text": "Convert the following CFG to CNF.", "marks": 7, "question_type": "Long", "is_important": True, "frequency_count": 6},
        ]
        for q in questions:
            try:
                supabase.table("questions").insert(q).execute()
            except Exception as e:
                print(f"Error seeding question: {e}")

    # 6. Mock Tests
    print("\nSeeding Mock Tests...")
    if toc_id:
        mock_test = {
            "subject_id": toc_id,
            "title": "TOC Mid-Sem Exam",
            "duration_minutes": 60,
            "max_score": 30
        }
        try:
            res = supabase.table("mock_tests").insert(mock_test).execute()
            if res.data:
                print(f"Created mock test: {mock_test['title']}")
        except Exception as e:
            print(f"Error seeding mock test: {e}")

    # 7. Study Materials (Previous Papers / Notes)
    print("\nSeeding Study Materials...")
    materials = [
        {
            "subject_code": "3160704",
            "title": "TOC Winter 2023 Paper",
            "material_type": "paper",
            "content": "Previous year question paper",
            "file_url": "https://www.gtu.ac.in/uploads/W2023/3160704.pdf"
        },
        {
            "subject_code": "3160704",
            "title": "Unit 1 - Automata Theory Notes",
            "material_type": "notes",
            "content": "Comprehensive notes for Unit 1",
            "file_url": "https://example.com/notes/toc_unit1.pdf"
        }
    ]
    for mat in materials:
        try:
            supabase.table("study_materials").insert(mat).execute()
        except Exception as e:
            print(f"Error seeding study material: {e}")

    print("\nData seeding completed!")

if __name__ == "__main__":
    seed_data()
