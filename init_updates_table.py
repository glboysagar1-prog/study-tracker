"""
Script to initialize the gtu_updates table in Supabase
Run this script to create the table for storing GTU circulars, news, and exam schedules
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

def init_updates_table():
    """Initialize the gtu_updates table in Supabase"""
    
    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        return False
    
    print(f"🔗 Connecting to Supabase at {supabase_url}...")
    
    try:
        # Create Supabase client
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # SQL to create the table
        sql = """
        -- Create gtu_updates table for storing GTU circulars, news, and exam schedules
        CREATE TABLE IF NOT EXISTS gtu_updates (
            id BIGSERIAL PRIMARY KEY,
            category VARCHAR(50) NOT NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            date DATE NOT NULL,
            link_url TEXT,
            content_hash VARCHAR(64) UNIQUE NOT NULL,
            is_latest BOOLEAN DEFAULT TRUE,
            scraped_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
        );

        -- Create indexes for faster queries
        CREATE INDEX IF NOT EXISTS idx_gtu_updates_category ON gtu_updates(category);
        CREATE INDEX IF NOT EXISTS idx_gtu_updates_date ON gtu_updates(date DESC);
        CREATE INDEX IF NOT EXISTS idx_gtu_updates_latest ON gtu_updates(is_latest);
        CREATE INDEX IF NOT EXISTS idx_gtu_updates_content_hash ON gtu_updates(content_hash);
        """
        
        # Execute SQL using RPC or direct SQL execution
        # Note: Supabase Python client doesn't have direct SQL execution
        # You need to run this SQL in the Supabase Dashboard SQL Editor
        
        print("📝 Please run the following SQL in your Supabase Dashboard SQL Editor:")
        print("=" * 80)
        print(sql)
        print("=" * 80)
        print("\n✅ Copy and paste the above SQL into Supabase Dashboard → SQL Editor → New Query")
        print("   Then click 'Run' to create the table.")
        print("\n🔗 Dashboard URL: https://supabase.com/dashboard/project/_/sql")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 GTU Updates Table Initialization Script")
    print("=" * 80)
    init_updates_table()
