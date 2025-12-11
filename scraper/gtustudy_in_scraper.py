#!/usr/bin/env python3
"""
Improved GTUStudy.in Scraper - Uses read_url approach
Scrapes syllabus, old papers, paper solutions, and study materials from gtustudy.in
"""
import os
import sys
import time
import re
import logging
import hashlib
import requests
from datetime import datetime
from dotenv import load_dotenv
from urllib.parse import urljoin

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('gtustudy_in_scraper.log', mode='w')
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(dotenv_path=os.path.join(basedir, '../.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not found in .env file")
    sys.exit(1)

from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Constants
BASE_URL = "https://gtustudy.in"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

# Syllabus pages to scrape
SYLLABUS_PAGES = [
    ("https://gtustudy.in/gtu-be-computer-engineering-syllabus/", "Computer Engineering"),
    ("https://gtustudy.in/gtu-be-information-technology-syllabus/", "Information Technology"),
    ("https://gtustudy.in/gtu-be-mechanical-engineering-syllabus/", "Mechanical Engineering"),
    ("https://gtustudy.in/gtu-be-civil-engineering-syllabus/", "Civil Engineering"),
    ("https://gtustudy.in/gtu-be-electrical-engineering-syllabus/", "Electrical Engineering"),
    ("https://gtustudy.in/gtu-be-electronics-communication-syllabus/", "Electronics & Communication"),
]

# Old papers semester pages
OLD_PAPERS_PAGES = [
    ("https://gtustudy.in/gtu-computer-engineering-1st-year-old-paper/", "Computer Engineering", 1),
    ("https://gtustudy.in/compter-engineering-sem-3-old-paper/", "Computer Engineering", 3),
    ("https://gtustudy.in/computer-engineering-sem-4-old-paper/", "Computer Engineering", 4),
    ("https://gtustudy.in/computer-engineering-sem-5-old-paper/", "Computer Engineering", 5),
    ("https://gtustudy.in/computer-engineering-sem-6-old-paper/", "Computer Engineering", 6),
    ("https://gtustudy.in/computer-engineering-sem-7-old-paper/", "Computer Engineering", 7),
    ("https://gtustudy.in/information-technology-sem-1-2-old-paper/", "Information Technology", 1),
    ("https://gtustudy.in/information-technology-sem-3-old-paper/", "Information Technology", 3),
    ("https://gtustudy.in/information-technology-sem-4-old-paper/", "Information Technology", 4),
    ("https://gtustudy.in/information-technology-sem-5-old-paper/", "Information Technology", 5),
    ("https://gtustudy.in/information-technology-sem-6-old-paper/", "Information Technology", 6),
]

# Study materials pages
STUDY_MATERIALS_PAGES = [
    ("https://gtustudy.in/gtu-1st-year-books-study-material/", "Common", 1),
    ("https://gtustudy.in/gtu-ceit-sem3-books-and-study-material/", "Computer Engineering", 3),
    ("https://gtustudy.in/computer-engineering-sem5-books-and-study-material/", "Computer Engineering", 5),
    ("https://gtustudy.in/computer-engineering-sem6-books-and-study-material/", "Computer Engineering", 6),
]


def fetch_page(url: str) -> str | None:
    """Fetch a page and return HTML content"""
    try:
        logger.info(f"Fetching: {url}")
        session = requests.Session()
        response = session.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()
        time.sleep(3)  # Be respectful - 3 second delay
        return response.text
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return None


def extract_pdf_urls(html: str) -> list:
    """Extract all PDF URLs from HTML content"""
    pdf_urls = []
    
    # Match various PDF URL patterns
    patterns = [
        # AWS S3 GTU syllabus URLs
        r'https://s3-ap-southeast-1\.amazonaws\.com/gtusitecirculars/Syallbus/(\d{7})\.pdf',
        # Direct PDF links 
        r'https?://[^\s"<>]+\.pdf',
        # Google Drive links
        r'https://drive\.google\.com/[^\s"<>]+',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html)
        if pattern == patterns[0]:  # S3 URLs
            for code in matches:
                full_url = f"https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/Syallbus/{code}.pdf"
                if full_url not in pdf_urls:
                    pdf_urls.append((full_url, code))
        else:
            for url in matches:
                if url not in [u[0] for u in pdf_urls] and '.pdf' in url.lower():
                    # Extract subject code from URL if possible
                    code_match = re.search(r'(\d{7})', url)
                    code = code_match.group(1) if code_match else None
                    pdf_urls.append((url, code))
    
    return pdf_urls


def extract_year(text: str) -> str | None:
    """Extract year from text"""
    match = re.search(r'(20\d{2})', text)
    return match.group(1) if match else None


def clear_old_data():
    """Remove old study materials from the database (except AI-Generated)"""
    logger.info("=" * 60)
    logger.info("CLEARING OLD DATA FROM DATABASE")
    logger.info("=" * 60)
    
    try:
        # Delete notes that are NOT AI-Generated
        logger.info("Deleting old notes (keeping AI-Generated)...")
        result = supabase.table("notes").delete().neq("source_name", "AI-Generated (GTU Exam Prep)").execute()
        logger.info(f"Deleted notes: {len(result.data) if result.data else 0} records")
        
        logger.info("Old data cleared successfully!")
        
    except Exception as e:
        logger.error(f"Error clearing old data: {e}")


def insert_syllabus_pdf(pdf_url: str, subject_code: str, branch: str, source_url: str) -> bool:
    """Insert syllabus PDF into notes table"""
    try:
        content_hash = hashlib.md5(pdf_url.encode()).hexdigest()
        
        # Check if exists
        existing = supabase.table("notes").select("id").eq("content_hash", content_hash).execute()
        if existing.data:
            logger.debug(f"Skipping duplicate: {pdf_url}")
            return False
        
        # Determine semester from subject code
        semester = None
        if subject_code:
            # GTU subject codescharacter 2 indicates semester
            # e.g., 3110005 -> sem 1, 3130702 -> sem 3, 3140702 -> sem 4
            try:
                sem_digit = int(subject_code[1])
                if sem_digit in [1, 2, 3, 4, 5, 6, 7, 8]:
                    semester = sem_digit
            except:
                pass
        
        data = {
            "title": f"Syllabus - {subject_code}" if subject_code else "GTU Syllabus",
            "subject_code": subject_code or "GENERAL",
            "unit": None,
            "description": f"Official GTU Syllabus PDF for {branch}",
            "file_url": pdf_url,
            "source_url": source_url,
            "source_name": "GTUStudy.in",
            "content_hash": content_hash,
            "created_at": datetime.now().isoformat(),
        }
        
        supabase.table("notes").insert(data).execute()
        logger.info(f"✓ Inserted syllabus: {subject_code}")
        return True
        
    except Exception as e:
        logger.error(f"Error inserting syllabus: {e}")
        return False


def insert_old_paper(pdf_url: str, subject_code: str, branch: str, semester: int, source_url: str) -> bool:
    """Insert old paper into previous_papers table"""
    try:
        # Check if paper already exists
        existing = supabase.table("previous_papers").select("id").eq("paper_pdf_url", pdf_url).execute()
        if existing.data:
            logger.debug(f"Skipping duplicate paper: {pdf_url}")
            return False
        
        # Try to find subject_id from subjects table
        subject_id = None
        if subject_code:
            sub_result = supabase.table("subjects").select("id").eq("subject_code", subject_code).execute()
            if sub_result.data:
                subject_id = sub_result.data[0]['id']
        
        # Extract year from URL
        year = extract_year(pdf_url) or "Unknown"
        
        data = {
            "subject_id": subject_id,
            "year": year,
            "exam_type": "Regular",
            "paper_pdf_url": pdf_url,
            "solution_pdf_url": None,
        }
        
        supabase.table("previous_papers").insert(data).execute()
        logger.info(f"✓ Inserted paper: {subject_code or 'Unknown'} - {year}")
        return True
        
    except Exception as e:
        logger.error(f"Error inserting paper: {e}")
        return False


def insert_study_material(pdf_url: str, title: str, subject_code: str, branch: str, semester: int, source_url: str) -> bool:
    """Insert study material into notes table"""
    try:
        content_hash = hashlib.md5(pdf_url.encode()).hexdigest()
        
        # Check if exists
        existing = supabase.table("notes").select("id").eq("content_hash", content_hash).execute()
        if existing.data:
            return False
        
        data = {
            "title": title or f"Study Material - {subject_code}",
            "subject_code": subject_code or "GENERAL",
            "unit": None,
            "description": f"Study material for {branch} Semester {semester}",
            "file_url": pdf_url,
            "source_url": source_url,
            "source_name": "GTUStudy.in",
            "content_hash": content_hash,
            "created_at": datetime.now().isoformat(),
        }
        
        supabase.table("notes").insert(data).execute()
        logger.info(f"✓ Inserted material: {title[:40] if title else subject_code}")
        return True
        
    except Exception as e:
        logger.error(f"Error inserting material: {e}")
        return False


def scrape_syllabus():
    """Scrape syllabus PDFs from all branch pages"""
    logger.info("\n" + "=" * 60)
    logger.info("SCRAPING SYLLABUS PDFS")
    logger.info("=" * 60)
    
    total_inserted = 0
    
    for url, branch in SYLLABUS_PAGES:
        html = fetch_page(url)
        if not html:
            continue
        
        pdf_urls = extract_pdf_urls(html)
        logger.info(f"Found {len(pdf_urls)} PDFs for {branch}")
        
        for pdf_url, subject_code in pdf_urls:
            if insert_syllabus_pdf(pdf_url, subject_code, branch, url):
                total_inserted += 1
    
    logger.info(f"Total syllabus PDFs inserted: {total_inserted}")
    return total_inserted


def scrape_old_papers():
    """Scrape old papers from semester pages"""
    logger.info("\n" + "=" * 60)
    logger.info("SCRAPING OLD PAPERS")
    logger.info("=" * 60)
    
    total_inserted = 0
    
    for url, branch, semester in OLD_PAPERS_PAGES:
        html = fetch_page(url)
        if not html:
            continue
        
        pdf_urls = extract_pdf_urls(html)
        logger.info(f"Found {len(pdf_urls)} papers for {branch} Sem {semester}")
        
        for pdf_url, subject_code in pdf_urls:
            if insert_old_paper(pdf_url, subject_code, branch, semester, url):
                total_inserted += 1
    
    logger.info(f"Total old papers inserted: {total_inserted}")
    return total_inserted


def scrape_study_materials():
    """Scrape study materials/books"""
    logger.info("\n" + "=" * 60)
    logger.info("SCRAPING STUDY MATERIALS")
    logger.info("=" * 60)
    
    total_inserted = 0
    
    for url, branch, semester in STUDY_MATERIALS_PAGES:
        html = fetch_page(url)
        if not html:
            continue
        
        pdf_urls = extract_pdf_urls(html)
        logger.info(f"Found {len(pdf_urls)} materials for {branch} Sem {semester}")
        
        for pdf_url, subject_code in pdf_urls:
            title = f"Study Material - Sem {semester}"
            if insert_study_material(pdf_url, title, subject_code, branch, semester, url):
                total_inserted += 1
    
    logger.info(f"Total study materials inserted: {total_inserted}")
    return total_inserted


def main():
    """Main scraper function"""
    start_time = datetime.now()
    
    logger.info("=" * 60)
    logger.info("GTUStudy.in SCRAPER v2")
    logger.info(f"Started at: {start_time}")
    logger.info("=" * 60)
    
    # Step 1: Clear old data
    clear_old_data()
    
    # Step 2: Scrape all content types
    syllabus_count = scrape_syllabus()
    papers_count = scrape_old_papers()
    materials_count = scrape_study_materials()
    
    # Summary
    end_time = datetime.now()
    duration = end_time - start_time
    
    logger.info("\n" + "=" * 60)
    logger.info("SCRAPING COMPLETE - SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Syllabus PDFs inserted: {syllabus_count}")
    logger.info(f"Old papers inserted: {papers_count}")
    logger.info(f"Study materials inserted: {materials_count}")
    logger.info(f"Total items: {syllabus_count + papers_count + materials_count}")
    logger.info(f"Duration: {duration}")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
