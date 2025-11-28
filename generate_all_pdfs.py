"""
Script to generate AI-powered PDFs for all available syllabus units.
This uses the detailed prompt template and legitimate scraped data.
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
from supabase import create_client
from backend.pdf_generator import generate_unit_pdf
import time

load_dotenv()

def get_all_syllabus_units():
    """Fetch all unique (subject_code, unit_number) pairs from syllabus"""
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("❌ Missing Supabase credentials")
        return []
    
    client = create_client(url, key)
    
    try:
        # Get all subjects
        subjects_res = client.table("subjects").select("subject_code, subject_name").execute()
        subjects = subjects_res.data
        
        if not subjects:
            print("❌ No subjects found")
            return []
        
        # For each subject, get all units from syllabus
        units = []
        for subject in subjects:
            subject_code = subject['subject_code']
            subject_name = subject['subject_name']
            
            # Get syllabus for this subject
            # First get subject_id
            sub_res = client.table("subjects").select("id").eq("subject_code", subject_code).execute()
            if not sub_res.data:
                continue
                
            subject_id = sub_res.data[0]['id']
            
            # Get syllabus units
            syl_res = client.table("syllabus").select("unit_number, unit_title").eq("subject_id", subject_id).execute()
            
            for syl in syl_res.data:
                units.append({
                    "subject_code": subject_code,
                    "subject_name": subject_name,
                    "unit_number": syl['unit_number'],
                    "unit_title": syl.get('unit_title', f"Unit {syl['unit_number']}")
                })
        
        return units
        
    except Exception as e:
        print(f"❌ Error fetching syllabus units: {e}")
        return []

def generate_all_pdfs():
    """Generate PDFs for all syllabus units"""
    print("🔍 Fetching all syllabus units...")
    units = get_all_syllabus_units()
    
    if not units:
        print("⚠️  No syllabus units found. Make sure you have syllabus data in the database.")
        return
    
    print(f"📚 Found {len(units)} units to generate")
    print("\nStarting PDF generation...\n")
    
    success_count = 0
    fail_count = 0
    
    for i, unit in enumerate(units, 1):
        subject_code = unit['subject_code']
        subject_name = unit['subject_name']
        unit_number = unit['unit_number']
        unit_title = unit['unit_title']
        
        print(f"[{i}/{len(units)}] Generating: {subject_name} - Unit {unit_number} ({unit_title})")
        
        try:
            result = generate_unit_pdf(subject_code, unit_number)
            
            if result.get("success"):
                print(f"  ✅ Success! Sources used: {result.get('sources_count', 0)}")
                success_count += 1
            else:
                print(f"  ❌ Failed: {result.get('error')}")
                fail_count += 1
                
        except Exception as e:
            print(f"  ❌ Exception: {e}")
            fail_count += 1
        
        # Rate limit to avoid overwhelming the API
        if i < len(units):
            print("  ⏳ Waiting 3 seconds before next generation...")
            time.sleep(3)
        
        print()
    
    print("\n" + "="*60)
    print(f"✅ Successfully generated: {success_count} PDFs")
    print(f"❌ Failed: {fail_count} PDFs")
    print(f"📊 Total: {len(units)} units")
    print("="*60)

if __name__ == "__main__":
    generate_all_pdfs()
