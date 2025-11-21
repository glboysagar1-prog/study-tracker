"""
Comprehensive GTU Content Scraper
Scrapes syllabus content, topics, and study materials from multiple sources
"""
import os
import logging
import requests
import time
import re
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

class GTUContentScraper:
    """Comprehensive GTU content scraper"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def scrape_tutorialspoint_content(self, topic_name):
        """Scrape study content from TutorialsPoint"""
        try:
            # Convert topic to URL-friendly format
            url_topic = topic_name.lower().replace(' ', '_')
            url = f"https://www.tutorialspoint.com/{url_topic}/index.htm"
            
            logger.info(f"Scraping TutorialsPoint: {url}")
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract main content
                content_div = soup.find('div', class_='content')
                if content_div:
                    return content_div.get_text(strip=True)[:500]  # First 500 chars
            
        except Exception as e:
            logger.debug(f"TutorialsPoint scrape failed: {e}")
        
        return None
    
    def scrape_geeksforgeeks_content(self, topic_name):
        """Scrape content from GeeksforGeeks"""
        try:
            url_topic = topic_name.lower().replace(' ', '-')
            url = f"https://www.geeksforgeeks.org/{url_topic}/"
            
            logger.info(f"Scraping GeeksforGeeks: {url}")
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Extract article content
                article = soup.find('article') or soup.find('div', class_='article')
                if article:
                    paragraphs = article.find_all('p')
                    if paragraphs:
                        return ' '.join([p.get_text(strip=True) for p in paragraphs[:3]])[:500]
            
        except Exception as e:
            logger.debug(f"GeeksforGeeks scrape failed: {e}")
        
        return None
    
    def get_study_material_links(self, subject_code):
        """Get study material links for a subject"""
        materials = []
        
        # Try multiple sources
        sources = [
            f"https://www.tutorialspoint.com",
            f"https://www.geeksforgeeks.org",
            f"https://www.javatpoint.com"
        ]
        
        for source in sources:
            materials.append({
                'source_name': source.split('//')[1].split('.')[1].title(),
                'source_url': source,
                'file_url': source
            })
        
        return materials

def populate_syllabus_content(subject_code, subject_name):
    """Populate syllabus content for a subject"""
    
    logger.info(f"\n{'='*60}")
    logger.info(f"Processing: {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    scraper = GTUContentScraper()
    
    # Define sample syllabus structure for common GTU subjects
    syllabus_templates = {
        "2140701": {  # Data Structures
            "units": [
                {
                    "unit": 1,
                    "unit_title": "Introduction to Data Structures",
                    "topics": [
                        "Introduction to Data Structures",
                        "Arrays and Array Operations",
                        "Pointers and Dynamic Memory",
                        "Structures in C"
                    ]
                },
                {
                    "unit": 2,
                    "unit_title": "Stacks and Queues",
                    "topics": [
                        "Stack Operations",
                        "Queue Operations",
                        "Circular Queue",
                        "Priority Queue"
                    ]
                },
                {
                    "unit": 3,
                    "unit_title": "Linked Lists",
                    "topics": [
                        "Singly Linked List",
                        "Doubly Linked List",
                        "Circular Linked List",
                        "Applications of Linked Lists"
                    ]
                },
                {
                    "unit": 4,
                    "unit_title": "Trees",
                    "topics": [
                        "Binary Trees",
                        "Binary Search Trees",
                        "AVL Trees",
                        "Tree Traversals"
                    ]
                },
                {
                    "unit": 5,
                    "unit_title": "Graphs and Hashing",
                    "topics": [
                        "Graph Representations",
                        "Graph Traversals",
                        "Hash Tables",
                        "Collision Resolution"
                    ]
                }
            ]
        },
        "3140703": {  # DBMS
            "units": [
                {
                    "unit": 1,
                    "unit_title": "Introduction to DBMS",
                    "topics": [
                        "Database System Concepts",
                        "Data Models",
                        "Database Architecture",
                        "DBMS vs File System"
                    ]
                },
                {
                    "unit": 2,
                    "unit_title": "Relational Model",
                    "topics": [
                        "Relational Model Concepts",
                        "Keys and Constraints",
                        "Relational Algebra",
                        "SQL Basics"
                    ]
                },
                {
                    "unit": 3,
                    "unit_title": "SQL and Advanced Queries",
                    "topics": [
                        "DDL and DML",
                        "Joins and Subqueries",
                        "Views and Indexes",
                        "Stored Procedures"
                    ]
                },
                {
                    "unit": 4,
                    "unit_title": "Normalization",
                    "topics": [
                        "Functional Dependencies",
                        "Normal Forms (1NF to BCNF)",
                        "Decomposition",
                        "Dependency Preservation"
                    ]
                },
                {
                    "unit": 5,
                    "unit_title": "Transaction Management",
                    "topics": [
                        "ACID Properties",
                        "Concurrency Control",
                        "Locking Protocols",
                        "Recovery Techniques"
                    ]
                }
            ]
        }
    }
    
    # Get syllabus template or create generic
    if subject_code in syllabus_templates:
        syllabus_data = syllabus_templates[subject_code]
    else:
        # Generic syllabus for unknown subjects
        syllabus_data = {
            "units": [
                {
                    "unit": i,
                    "unit_title": f"Unit {i}",
                    "topics": [f"Topic {i}.{j}" for j in range(1, 5)]
                }
                for i in range(1, 6)
            ]
        }
    
    # Insert syllabus content
    inserted_count = 0
    for unit_data in syllabus_data["units"]:
        for topic in unit_data["topics"]:
            try:
                # Try to scrape additional content
                content = scraper.scrape_geeksforgeeks_content(topic)
                if not content:
                    content = scraper.scrape_tutorialspoint_content(topic)
                
                syllabus_item = {
                    "subject_code": subject_code,
                    "unit": unit_data["unit"],
                    "unit_title": unit_data["unit_title"],
                    "topic": topic,
                    "content": content or f"Study material for {topic}"
                }
                
                supabase.table("syllabus_content").insert(syllabus_item).execute()
                inserted_count += 1
                logger.info(f"  ✓ Unit {unit_data['unit']}: {topic}")
                
                time.sleep(0.5)  # Be polite
                
            except Exception as e:
                logger.error(f"  ✗ Failed to insert {topic}: {e}")
    
    logger.info(f"✅ Inserted {inserted_count} syllabus items")
    
    # Add study notes
    logger.info("\nAdding study notes...")
    notes_count = 0
    for unit_data in syllabus_data["units"]:
        try:
            note_data = {
                "subject_code": subject_code,
                "unit": unit_data["unit"],
                "title": f"{subject_name} - Unit {unit_data['unit']} Notes",
                "description": f"Comprehensive notes for {unit_data['unit_title']}",
                "file_url": f"https://www.tutorialspoint.com/{subject_name.lower().replace(' ', '_')}/index.htm",
                "source_name": "TutorialsPoint",
                "source_url": "https://www.tutorialspoint.com"
            }
            
            supabase.table("notes").insert(note_data).execute()
            notes_count += 1
            logger.info(f"  ✓ Added notes for Unit {unit_data['unit']}")
            
        except Exception as e:
            logger.debug(f"  Note insert failed: {e}")
    
    logger.info(f"✅ Inserted {notes_count} study notes")
    
    return inserted_count + notes_count

def scrape_all_subjects():
    """Scrape content for all subjects in the database"""
    
    logger.info("\n" + "="*60)
    logger.info("COMPREHENSIVE GTU CONTENT SCRAPER")
    logger.info("="*60 + "\n")
    
    # Get all subjects from database
    subjects_response = supabase.table("subjects").select("*").execute()
    subjects = subjects_response.data
    
    if not subjects:
        logger.error("No subjects found in database!")
        return
    
    logger.info(f"Found {len(subjects)} subjects to process\n")
    
    total_items = 0
    for subject in subjects:
        subject_code = subject['subject_code']
        subject_name = subject['subject_name']
        
        # Clear existing syllabus content for this subject
        logger.info(f"Clearing existing content for {subject_code}...")
        supabase.table("syllabus_content").delete().eq("subject_code", subject_code).execute()
        
        # Scrape and populate
        items = populate_syllabus_content(subject_code, subject_name)
        total_items += items
        
        time.sleep(2)  # Rate limiting between subjects
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ SCRAPING COMPLETE!")
    logger.info(f"Total items inserted: {total_items}")
    logger.info("="*60)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        # Scrape specific subject
        subject_code = sys.argv[1]
        subject_response = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
        if subject_response.data:
            subject = subject_response.data[0]
            populate_syllabus_content(subject['subject_code'], subject['subject_name'])
        else:
            logger.error(f"Subject {subject_code} not found")
    else:
        # Scrape all subjects
        scrape_all_subjects()
