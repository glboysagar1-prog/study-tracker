import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(
    host=os.environ.get("SUPABASE_DB_HOST"),
    database="postgres",
    user="postgres",
    password=os.environ.get("SUPABASE_DB_PASSWORD"),
    port=5432
)
cursor = conn.cursor()

with open('create_comprehensive_study_schema.sql', 'r') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    conn.commit()
    print("Schema applied successfully.")
except Exception as e:
    print(f"Error applying schema: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
