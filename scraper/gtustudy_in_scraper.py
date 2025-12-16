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


def extract_links_with_metadata(html: str) -> list:
    """Extract PDF and PPT URLs with metadata (text, type) from HTML"""
    links = []
    
    # Use simple regex for efficiency, but BeautifulSoup would be better for text extraction.
    # Let's try to capture the <a> tag context if possible, or just URL patterns.
    # Since we don't have BS4 in this file yet (it imported re), let's stick to regex 
    # but try to capture the link text if it's an <a> tag.
    
    # Pattern to match <a href="...">...</a>
    # This is fragile but works for simple pages.
    link_pattern = r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>'
    
    matches = re.findall(link_pattern, html, re.IGNORECASE | re.DOTALL)
    
    for url, text in matches:
        # Clean text
        text = re.sub(r'<[^>]+>', '', text).strip()
        
        # Check extensions
        lower_url = url.lower()
        file_type = None
        
        if '.pdf' in lower_url:
            file_type = 'pdf'
        elif '.ppt' in lower_url or '.pptx' in lower_url:
            file_type = 'ppt'
        elif 'drive.google.com' in lower_url:
            # Assume it's a material link
            file_type = 'drive'
        
        if file_type:
            # Extract subject code
            code_match = re.search(r'(\d{7})', url) or re.search(r'(\d{7})', text)
            code = code_match.group(1) if code_match else None
            
            # Identify if it's a solution
            is_solution = 'solution' in lower_url or 'sol' in lower_url or 'answer' in lower_url or 'solution' in text.lower()
            
            links.append({
                'url': url,
                'text': text,
                'code': code,
                'type': file_type,
                'is_solution': is_solution
            })
            
    # Also catch bare URLs that might not be in <a> tags (less common for clickable downloads but good backup)
    # Keeping the original pattern logic as a fallback could be useful, but let's trust the link extractor for now
    # to avoid duplicates and getting random non-clickable URLs.
    
    # Filter duplicates based on URL
    unique_links = []
    seen_urls = set()
    for link in links:
        if link['url'] not in seen_urls:
            seen_urls.add(link['url'])
            unique_links.append(link)
            
    return unique_links


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


def insert_old_paper(pdf_url: str, subject_code: str, branch: str, semester: int, source_url: str, is_solution: bool=False) -> bool:
    """Insert old paper or solution into previous_papers table"""
    try:
        # Check if subject exists
        subject_id = None
        if subject_code:
            sub_result = supabase.table("subjects").select("id").eq("subject_code", subject_code).execute()
            if sub_result.data:
                subject_id = sub_result.data[0]['id']
        
        # Extract year/season from URL or context
        year = extract_year(pdf_url) or "Unknown"
        
        # Check for existing record for this subject/year
        # This is a heuristic matching
        existing_query = supabase.table("previous_papers").select("id, paper_pdf_url, solution_pdf_url").eq("year", year)
        if subject_id:
            existing_query = existing_query.eq("subject_id", subject_id)
            
        existing = existing_query.execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing record
            record = existing.data[0]
            record_id = record['id']
            
            update_data = {}
            if is_solution:
                if not record['solution_pdf_url']:
                    update_data['solution_pdf_url'] = pdf_url
                    logger.info(f"  ✓ Updated solution for: {subject_code} - {year}")
            else:
                if not record['paper_pdf_url']:
                    update_data['paper_pdf_url'] = pdf_url
                    logger.info(f"  ✓ Updated paper for: {subject_code} - {year}")
            
            if update_data:
                supabase.table("previous_papers").update(update_data).eq("id", record_id).execute()
                return True
            else:
                return False # Already has this link
                
        else:
            # Create new record
            data = {
                "subject_id": subject_id,
                "year": year,
                "exam_type": "Regular",
                "paper_pdf_url": None if is_solution else pdf_url, # If solution only, explicit paper might be missing
                "solution_pdf_url": pdf_url if is_solution else None,
            }
            
            # If schema requires paper_pdf_url, we might need to put a placeholder or checking schema.
            # Assuming nullable for now based on logic.
            if is_solution:
                 # If we only have solution, maybe we shouldn't insert? 
                 # Often solutions come with papers.
                 # But let's insert it if allows.
                 pass

            supabase.table("previous_papers").insert(data).execute()
            logger.info(f"✓ Inserted {'solution' if is_solution else 'paper'}: {subject_code or 'Unknown'} - {year}")
            return True
        
    except Exception as e:
        logger.error(f"Error inserting paper/solution: {e}")
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
        
        links = extract_links_with_metadata(html)
        logger.info(f"Found {len(links)} links for {branch}")
        
        for link in links:
            if link['type'] == 'pdf' or link['type'] == 'drive':
                # Syllabus is usually just the PDF
                if insert_syllabus_pdf(link['url'], link['code'], branch, url):
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
        
        links = extract_links_with_metadata(html)
        logger.info(f"Found {len(links)} links for {branch} Sem {semester}")
        
        # Group by subject/year to pair papers and solutions?
        # For now, simplistic insertion: check if it's a solution and update or insert generic.
        # But `insert_old_paper` needs to be updated to handle this distinction.
        # Let's update `insert_old_paper` signature first in a separate tool call if needed, 
        # or just pass the info.
        
        for link in links:
            if link['type'] == 'pdf':
                if insert_old_paper(link['url'], link['code'], branch, semester, url, is_solution=link['is_solution']):
                    total_inserted += 1
    
    logger.info(f"Total old papers/solutions processed: {total_inserted}")
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
        
        links = extract_links_with_metadata(html)
        logger.info(f"Found {len(links)} materials for {branch} Sem {semester}")
        
        for link in links:
            # Handle PDF, PPT, and Drive links
            if link['type'] in ['pdf', 'ppt', 'drive']:
                # Differentiate title based on type
                type_label = "Presentation" if link['type'] == 'ppt' else "Material"
                title = f"{link['text']} ({type_label})" if link['text'] else f"Study {type_label} - Sem {semester}"
                
                if insert_study_material(link['url'], title, link['code'], branch, semester, url):
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
