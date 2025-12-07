#!/usr/bin/env python3
"""
Seed syllabus_content data into notes table for frontend display.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

# CE Sem 3 Subject mapping (id to code)
CE_SEM3_SUBJECTS = {
    "3130702": "Data Structures",
    "3130703": "Database Management Systems", 
    "3130704": "Digital Fundamentals",
    "3130006": "Probability and Statistics",
    "3130705": "Object Oriented Programming"
}

def seed_notes_from_syllabus():
    """Copy syllabus_content to notes table for frontend display"""
    print("📚 Seeding notes from syllabus_content...")
    
    total_seeded = 0
    
    for subject_code, subject_name in CE_SEM3_SUBJECTS.items():
        print(f"\n  Processing: {subject_name} ({subject_code})")
        
        # Fetch syllabus content for this subject
        result = supabase.table("syllabus_content").select("*").eq("subject_code", subject_code).execute()
        
        if not result.data:
            print(f"    ⚠ No syllabus content found")
            continue
            
        # Group by unit
        units = {}
        for item in result.data:
            unit = item.get("unit", 1)
            if unit not in units:
                units[unit] = []
            units[unit].append(item)
        
        # Create one note per unit
        for unit_num, topics in units.items():
            # Combine topics into description
            topic_list = [t.get("topic", "") for t in topics]
            content_list = [t.get("content", "")[:500] for t in topics[:3]]  # First 3 topic contents
            
            description = f"Topics covered: {', '.join(topic_list)}\n\n{chr(10).join(content_list)}"
            
            note_data = {
                "subject_code": subject_code,
                "subject_name": subject_name,
                "unit": unit_num,
                "title": f"{subject_name} - Unit {unit_num} Study Notes",
                "description": description[:2000],  # Limit description
                "file_url": f"#unit-{unit_num}",  # Placeholder - could generate PDF later
                "source_url": topics[0].get("source_url", ""),
                "source_name": "AI-Generated (GTU Exam Prep)",
                "downloads": 0,
                "views": 0,
                "is_verified": True
            }
            
            try:
                supabase.table("notes").insert(note_data).execute()
                print(f"    ✓ Unit {unit_num}: {len(topics)} topics")
                total_seeded += 1
            except Exception as e:
                print(f"    ✗ Unit {unit_num}: {e}")
        
    print(f"\n✅ Seeded {total_seeded} notes from syllabus content!")
    return total_seeded

def verify_notes():
    """Verify notes are in database"""
    print("\n📊 Verification - Notes per subject:")
    
    for subject_code, subject_name in CE_SEM3_SUBJECTS.items():
        result = supabase.table("notes").select("*", count="exact").eq("subject_code", subject_code).execute()
        print(f"  - {subject_name}: {len(result.data)} notes")

if __name__ == "__main__":
    print("=" * 60)
    print("🌱 Seeding Notes for Frontend")
    print("=" * 60)
    
    seed_notes_from_syllabus()
    verify_notes()
    
    print("\n" + "=" * 60)
    print("Done! Notes should now appear in Study Materials section.")
    print("=" * 60)
