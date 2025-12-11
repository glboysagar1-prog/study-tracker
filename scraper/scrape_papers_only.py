#!/usr/bin/env python3
"""Quick script to re-run only old papers scraping after fixing the schema issue"""
import os
import sys
import time
import re
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(dotenv_path=os.path.join(basedir, '../.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

from supabase import create_client, Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
}

OLD_PAPERS_PAGES = [
    ("https://gtustudy.in/gtu-computer-engineering-1st-year-old-paper/", "Computer Engineering", 1),
    ("https://gtustudy.in/compter-engineering-sem-3-old-paper/", "Computer Engineering", 3),
    ("https://gtustudy.in/computer-engineering-sem-4-old-paper/", "Computer Engineering", 4),
    ("https://gtustudy.in/computer-engineering-sem-5-old-paper/", "Computer Engineering", 5),
    ("https://gtustudy.in/computer-engineering-sem-6-old-paper/", "Computer Engineering", 6),
    ("https://gtustudy.in/information-technology-sem-3-old-paper/", "Information Technology", 3),
    ("https://gtustudy.in/information-technology-sem-4-old-paper/", "Information Technology", 4),
    ("https://gtustudy.in/information-technology-sem-6-old-paper/", "Information Technology", 6),
]

def fetch_page(url: str) -> str | None:
    try:
        logger.info(f"Fetching: {url}")
        response = requests.get(url, headers=HEADERS, timeout=60)
        response.raise_for_status()
        time.sleep(3)
        return response.text
    except Exception as e:
        logger.error(f"Error fetching {url}: {e}")
        return None

def extract_pdf_urls(html: str) -> list:
    pdf_urls = []
    # Match GTU paper URLs
    patterns = [
        r'https://gtu\.ac\.in/uploads/[^"<>\s]+\.pdf',
        r'https://s3-ap-southeast-1\.amazonaws\.com/gtusitecirculars[^"<>\s]+\.pdf',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, html)
        for url in matches:
            code_match = re.search(r'(\d{7})', url)
            code = code_match.group(1) if code_match else None
            if (url, code) not in pdf_urls:
                pdf_urls.append((url, code))
    
    return pdf_urls

def extract_year(text: str) -> str:
    match = re.search(r'(20\d{2})', text)
    return match.group(1) if match else "Unknown"

def insert_old_paper(pdf_url: str, subject_code: str, branch: str, semester: int, source_url: str) -> bool:
    try:
        existing = supabase.table("previous_papers").select("id").eq("paper_pdf_url", pdf_url).execute()
        if existing.data:
            return False
        
        subject_id = None
        if subject_code:
            sub_result = supabase.table("subjects").select("id").eq("subject_code", subject_code).execute()
            if sub_result.data:
                subject_id = sub_result.data[0]['id']
        
        year = extract_year(pdf_url)
        
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

def main():
    logger.info("=" * 60)
    logger.info("SCRAPING OLD PAPERS ONLY")
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
    
    logger.info(f"\nTotal old papers inserted: {total_inserted}")

if __name__ == "__main__":
    main()
