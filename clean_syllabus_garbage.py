import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)

def clean_garbage_syllabus():
    print("🔍 Inspecting ALL syllabus_content for garbage data...")
    
    # Fetch all content that matches garbage patterns
    # We'll do this in python to be safe with multiple conditions
    
    # Fetch all content (might be large, but safer for inspection)
    # Or we can use 'ilike' filters if we do multiple queries
    
    garbage_ids = []
    
    # Pattern 1: GTU Ranker in topic
    print("  Checking for 'GTU Ranker'...")
    resp1 = supabase.table("syllabus_content").select("id, topic, subject_code").ilike("topic", "%GTU Ranker%").execute()
    if resp1.data:
        print(f"  Found {len(resp1.data)} items with 'GTU Ranker'")
        for item in resp1.data:
            garbage_ids.append(item['id'])

    # Pattern 2: Shopping Deals in content
    print("  Checking for 'Shopping Deals'...")
    resp2 = supabase.table("syllabus_content").select("id, topic, subject_code").ilike("content", "%Shopping Deals%").execute()
    if resp2.data:
        print(f"  Found {len(resp2.data)} items with 'Shopping Deals'")
        for item in resp2.data:
            garbage_ids.append(item['id'])

    # Pattern 3: "I was a student at GTU"
    print("  Checking for blog intro text...")
    resp3 = supabase.table("syllabus_content").select("id, topic, subject_code").ilike("content", "%I was a student at GTU%").execute()
    if resp3.data:
        print(f"  Found {len(resp3.data)} items with blog text")
        for item in resp3.data:
            garbage_ids.append(item['id'])
            
    # Remove duplicates
    garbage_ids = list(set(garbage_ids))
    
    if garbage_ids:
        print(f"\n⚠️ Deleting {len(garbage_ids)} unique garbage entries across all subjects...")
        for gid in garbage_ids:
            try:
                supabase.table("syllabus_content").delete().eq("id", gid).execute()
                print(f"✓ Deleted ID {gid}")
            except Exception as e:
                print(f"❌ Failed to delete ID {gid}: {e}")
    else:
        print("\n✅ No garbage data found in any subject.")

if __name__ == "__main__":
    clean_garbage_syllabus()
