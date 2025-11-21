import psycopg2
from itemadapter import ItemAdapter
from datetime import datetime
import hashlib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SupabasePipeline:
    def __init__(self):
        # Supabase PostgreSQL connection
        self.connection = psycopg2.connect(
            host=os.getenv('SUPABASE_DB_HOST', 'db.your-project-ref.supabase.co'),
            database='postgres',
            user='postgres',
            password=os.getenv('SUPABASE_DB_PASSWORD', 'your-password'),
            port=5432
        )
        self.cursor = self.connection.cursor()
    
    def open_spider(self, spider):
        """Called when spider opens - create tables if needed"""
        spider.logger.info("Creating tables if not exists...")
        
        # Create subjects table (if not exists) - adapting from user's syllabus table idea
        # Note: We use 'subjects' to match our app schema
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id SERIAL PRIMARY KEY,
                course VARCHAR(100),
                branch VARCHAR(100),
                semester VARCHAR(10),
                subject_code VARCHAR(50),
                subject_name VARCHAR(255),
                credits INTEGER,
                syllabus_pdf_url TEXT,
                pdf_checksum VARCHAR(64),
                scraped_at TIMESTAMP,
                is_latest BOOLEAN DEFAULT TRUE,
                UNIQUE(course, branch, semester, subject_code)
            )
        """)
        
        # Create previous_papers table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS previous_papers (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                subject_code VARCHAR(50),
                year VARCHAR(10),
                exam_type VARCHAR(50),
                semester VARCHAR(10),
                branch VARCHAR(100),
                paper_pdf_url TEXT,
                solution_pdf_url TEXT,
                pdf_checksum VARCHAR(64),
                scraped_at TIMESTAMP,
                UNIQUE(subject_code, year, exam_type)
            )
        """)

        # Create study_materials table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS study_materials (
                id SERIAL PRIMARY KEY,
                subject_id INTEGER REFERENCES subjects(id),
                title VARCHAR(255) NOT NULL,
                content TEXT,
                material_type VARCHAR(50) DEFAULT 'notes',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """)

        # Create gtu_updates table
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS gtu_updates (
                id SERIAL PRIMARY KEY,
                category VARCHAR(50),
                title TEXT,
                description TEXT,
                date DATE,
                link_url TEXT,
                content_hash VARCHAR(64) UNIQUE,
                is_latest BOOLEAN DEFAULT TRUE,
                scraped_at TIMESTAMP
            )
        """)
        
        self.connection.commit()
        spider.logger.info("Tables ready!")
    
    def process_item(self, item, spider):
        """Process each scraped item"""
        adapter = ItemAdapter(item)
        item_class_name = item.__class__.__name__
        
        # Route to appropriate handler based on item type
        if item_class_name == 'GtuSyllabusItem':
            self.save_subject(adapter, spider)
        elif item_class_name == 'PreviousPaperItem':
            self.save_previous_paper(adapter, spider)
        elif item_class_name == 'StudyMaterialItem':
            self.save_study_material(adapter, spider)
        elif item_class_name in ['GtuCircularItem', 'GtuNewsItem', 'GtuExamScheduleItem']:
            self.save_update(adapter, spider)
        
        return item
    
    def save_subject(self, item, spider):
        """Save subject data (syllabus)"""
        pdf_checksum = self.get_pdf_checksum(item.get('syllabus_pdf_url'))
        
        # Check if subject already exists
        self.cursor.execute("""
            SELECT id, pdf_checksum FROM subjects 
            WHERE course=%s AND branch=%s AND semester=%s AND subject_code=%s
        """, (
            item.get('course'),
            item.get('branch'),
            item.get('semester'),
            item.get('subject_code')
        ))
        
        result = self.cursor.fetchone()
        
        if not result:
            # Insert new
            self.cursor.execute("""
                INSERT INTO subjects (
                    course, branch, semester, subject_code, subject_name,
                    credits, syllabus_pdf_url, pdf_checksum, scraped_at, is_latest
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                item.get('course'),
                item.get('branch'),
                item.get('semester'),
                item.get('subject_code'),
                item.get('subject_name'),
                item.get('credits', 0),
                item.get('syllabus_pdf_url'),
                pdf_checksum,
                datetime.now(),
                True
            ))
            spider.logger.info(f"✨ NEW SUBJECT: {item.get('subject_name')}")
        else:
            # Update if needed (logic simplified for brevity)
            spider.logger.info(f"Subject exists: {item.get('subject_name')}")
            
        self.connection.commit()
    
    def save_previous_paper(self, item, spider):
        """Save previous paper"""
        # Resolve subject_id
        self.cursor.execute("SELECT id FROM subjects WHERE subject_name ILIKE %s LIMIT 1", (f"%{item.get('subject_name')}%",))
        res = self.cursor.fetchone()
        subject_id = res[0] if res else None
        
        if not subject_id:
            spider.logger.warning(f"Subject not found for paper: {item.get('subject_name')}")
            # We might want to insert without subject_id or skip
            # For now, let's skip to avoid FK violation if enforced, or insert with NULL
            # But our table definition has subject_id REFERENCES subjects(id), so it must exist or be NULL (if allowed). 
            # It is nullable in my definition above.
        
        # Check for duplicates
        self.cursor.execute("""
            SELECT id FROM previous_papers 
            WHERE paper_pdf_url=%s
        """, (item.get('paper_pdf_url'),))
        
        if not self.cursor.fetchone():
            self.cursor.execute("""
                INSERT INTO previous_papers (
                    subject_id, subject_code, year, exam_type, 
                    paper_pdf_url, solution_pdf_url, scraped_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                subject_id,
                item.get('subject_code'),
                item.get('year'),
                item.get('exam_type'),
                item.get('paper_pdf_url'),
                item.get('solution_pdf_url'),
                datetime.now()
            ))
            self.connection.commit()
            spider.logger.info(f"📄 NEW PAPER: {item.get('paper_pdf_url')}")
    
    def save_study_material(self, item, spider):
        """Save study material"""
        # Resolve subject_id
        self.cursor.execute("SELECT id FROM subjects WHERE subject_name ILIKE %s LIMIT 1", (f"%{item.get('subject_name')}%",))
        res = self.cursor.fetchone()
        subject_id = res[0] if res else None
        
        # Check duplicate
        self.cursor.execute("SELECT id FROM study_materials WHERE content=%s", (item.get('content_url'),))
        if not self.cursor.fetchone():
            self.cursor.execute("""
                INSERT INTO study_materials (
                    subject_id, title, content, material_type, created_at
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                subject_id,
                item.get('title'),
                item.get('content_url'),
                item.get('material_type'),
                datetime.now()
            ))
            self.connection.commit()
            spider.logger.info(f"📚 NEW MATERIAL: {item.get('title')}")

    def save_update(self, item, spider):
        """Save GTU update"""
        self.cursor.execute("SELECT id FROM gtu_updates WHERE content_hash=%s", (item.get('content_hash'),))
        if not self.cursor.fetchone():
            self.cursor.execute("""
                INSERT INTO gtu_updates (
                    category, title, description, date, link_url, content_hash, is_latest, scraped_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                item.get('category'),
                item.get('title'),
                item.get('description'),
                item.get('date'),
                item.get('link_url'),
                item.get('content_hash'),
                True,
                item.get('scraped_at')
            ))
            self.connection.commit()
            spider.logger.info(f"📢 NEW UPDATE: {item.get('title')}")

    def get_pdf_checksum(self, url):
        """Calculate checksum for change detection"""
        if not url: return None
        try:
            response = requests.get(url, timeout=10)
            return hashlib.sha256(response.content).hexdigest()
        except Exception:
            return None
    
    def close_spider(self, spider):
        """Called when spider closes"""
        spider.logger.info("Closing database connection...")
        self.cursor.close()
        self.connection.close()