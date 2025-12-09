import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("❌ Error: DATABASE_URL not found in environment variables.")
        return

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        with open('backend/db/create_predicted_papers_table.sql', 'r') as f:
            sql = f.read()
            
        print("Executing migration...")
        cur.execute(sql)
        conn.commit()
        print("✅ Migration successful: predicted_papers table created.")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate()
