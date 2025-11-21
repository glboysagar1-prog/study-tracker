"""
GTU Previous Year Question Paper Web Scraper
Uses BeautifulSoup to scrape papers from static sources
"""
import os
import logging
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Headers to avoid being blocked
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

class GTUPaperScraper:
    """Scraper for GTU previous year papers"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def scrape_gtu_collegepapers(self, subject_code):
        """
        Try to scrape from collegepaper.in
        This is a static-ish site that might work
        """
        papers = []
        
        try:
            url = f"https://www.collegepaper.in/gtu-question-papers/{subject_code}"
            logger.info(f"Attempting to scrape: {url}")
            
            response = self.session.get(url, timeout=10)
            
            if response.status_code != 200:
                logger.warning(f"Failed to fetch page: {response.status_code}")
                return papers
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for paper links (this is a guess at the structure)
            # Most GTU paper sites have tables or lists with download links
            paper_links = soup.find_all('a', href=True)
            
            for link in paper_links:
                href = link['href']
                text = link.get_text(strip=True)
                
                # Look for PDF links or paper-related links
                if 'pdf' in href.lower() or 'download' in href.lower():
                    # Try to extract year and exam type from text
                    year = None
                    exam_type = None
                    
                    if 'winter' in text.lower() or 'w-' in text.lower():
                        exam_type = 'Winter'
                    elif 'summer' in text.lower() or 's-' in text.lower():
                        exam_type = 'Summer'
                    
                    # Look for year (20XX pattern)
                    import re
                    year_match = re.search(r'20\d{2}', text)
                    if year_match:
                        year = int(year_match.group())
                    
                    if year and exam_type:
                        papers.append({
                            'year': year,
                            'exam_type': exam_type,
                            'paper_pdf_url': href if href.startswith('http') else f"https://www.collegepaper.in{href}",
                            'solution_pdf_url': None
                        })
            
            logger.info(f"Found {len(papers)} papers via web scraping")
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
        
        return papers
    
    def scrape_gtupaper_archives(self, subject_code):
        """
        Try alternative scraping approach for GTU paper archives
        """
        papers = []
        
        try:
            # Try a generic paper search approach
            url = f"https://gtupaper.in/papers/{subject_code}"
            logger.info(f"Attempting to scrape: {url}")
            
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Look for table rows or list items containing papers
                tables = soup.find_all('table')
                for table in tables:
                    rows = table.find_all('tr')
                    for row in rows:
                        cells = row.find_all(['td', 'th'])
                        if len(cells) >= 2:
                            text = ' '.join([cell.get_text(strip=True) for cell in cells])
                            
                            # Extract paper info
                            import re
                            year_match = re.search(r'20\d{2}', text)
                            
                            if year_match:
                                year = int(year_match.group())
                                exam_type = 'Winter' if 'winter' in text.lower() else 'Summer'
                                
                                # Look for download link in the row
                                link = row.find('a', href=True)
                                if link and 'pdf' in link['href'].lower():
                                    papers.append({
                                        'year': year,
                                        'exam_type': exam_type,
                                        'paper_pdf_url': link['href'],
                                        'solution_pdf_url': None
                                    })
                
                logger.info(f"Found {len(papers)} papers via archive scraping")
                
        except Exception as e:
            logger.error(f"Archive scraping error: {e}")
        
        return papers
    
    def get_curated_papers(self, subject_code):
        """Fallback to curated data"""
        curated_data = {
            "2140701": [
                {
                    "year": 2023,
                    "exam_type": "Winter",
                    "paper_pdf_url": "https://drive.google.com/file/d/example_w2023/view",
                    "solution_pdf_url": None,
                },
                {
                    "year": 2023,
                    "exam_type": "Summer",
                    "paper_pdf_url": "https://drive.google.com/file/d/example_s2023/view",
                    "solution_pdf_url": None,
                },
                {
                    "year": 2022,
                    "exam_type": "Winter",
                    "paper_pdf_url": "https://drive.google.com/file/d/example_w2022/view",
                    "solution_pdf_url": None,
                },
            ]
        }
        return curated_data.get(subject_code, [])

def populate_papers(subject_code, use_scraping=True):
    """Populate papers using web scraping or curated data"""
    
    scraper = GTUPaperScraper()
    papers = []
    
    if use_scraping:
        logger.info("Attempting web scraping...")
        
        # Try multiple sources
        papers.extend(scraper.scrape_gtu_collegepapers(subject_code))
        time.sleep(1)  # Be polite
        
        papers.extend(scraper.scrape_gtupaper_archives(subject_code))
        
        if not papers:
            logger.warning("No papers found via scraping, using curated data")
            papers = scraper.get_curated_papers(subject_code)
    else:
        papers = scraper.get_curated_papers(subject_code)
    
    if not papers:
        logger.error(f"No papers available for {subject_code}")
        return False
    
    # Get subject ID
    subject_check = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
    
    if not subject_check.data:
        logger.error(f"Subject {subject_code} not found in database")
        return False
    
    subject_id = subject_check.data[0]['id']
    
    # Clear existing papers
    logger.info(f"Clearing existing papers for subject {subject_code}")
    supabase.table("previous_papers").delete().eq("subject_id", subject_id).execute()
    
    # Insert new papers
    inserted_count = 0
    for paper in papers:
        try:
            paper_data = {
                "subject_id": subject_id,
                "year": paper["year"],
                "exam_type": paper["exam_type"],
                "paper_pdf_url": paper["paper_pdf_url"],
                "solution_pdf_url": paper.get("solution_pdf_url"),
            }
            
            supabase.table("previous_papers").insert(paper_data).execute()
            inserted_count += 1
            logger.info(f"✓ Inserted {paper['exam_type']} {paper['year']}")
            
        except Exception as e:
            logger.error(f"✗ Failed to insert paper: {e}")
    
    logger.info(f"✅ Successfully inserted {inserted_count}/{len(papers)} papers")
    return True

if __name__ == "__main__":
    import sys
    
    subject_code = sys.argv[1] if len(sys.argv) > 1 else "2140701"
    use_scraping = "--scrape" in sys.argv
    
    logger.info(f"{'='*60}")
    logger.info(f"Mode: {'Web Scraping' if use_scraping else 'Curated Data'}")
    logger.info(f"Subject: {subject_code}")
    logger.info(f"{'='*60}\n")
    
    populate_papers(subject_code, use_scraping=use_scraping)
