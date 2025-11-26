import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # Try constructing from Supabase params if DATABASE_URL not present
    SUPABASE_DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD')
    SUPABASE_PROJECT_ID = os.getenv('SUPABASE_PROJECT_ID')
    if SUPABASE_DB_PASSWORD and SUPABASE_PROJECT_ID:
        DATABASE_URL = f"postgresql://postgres:{SUPABASE_DB_PASSWORD}@db.{SUPABASE_PROJECT_ID}.supabase.co:5432/postgres"

def init_db():
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL not found in environment variables.")
        return

    try:
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        # Read schema file
        schema_path = 'scraper/crawlee-scraper/schema.sql'
        print(f"📖 Reading schema from {schema_path}...")
        with open(schema_path, 'r') as f:
            schema_sql = f.read()

        # Execute schema
        print("⚡ Executing schema...")
        cur.execute(schema_sql)
        conn.commit()
        
        print("✅ Database initialized successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
