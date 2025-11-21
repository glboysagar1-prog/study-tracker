import os
import time
import logging
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(dotenv_path=os.path.join(basedir, '../.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Supabase credentials not found in .env file")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_gtu_syllabus_pdf(subject_code):
    """
    Scrape the official syllabus PDF link from gtu.ac.in using Google search
    """
    logger.info(f"Searching for official syllabus PDF for subject: {subject_code}")
    try:
        # Use Google search to find PDF
        search_url = f"https://www.google.com/search?q=site:gtu.ac.in+syllabus+{subject_code}+pdf"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find PDF links
        pdf_url = None
        for link in soup.find_all('a', href=True):
            href = link['href']
            if '.pdf' in href and 'gtu.ac.in' in href:
                # Extract actual URL from Google redirect
                if 'url?q=' in href:
                    pdf_url = href.split('url?q=')[1].split('&')[0]
                    break
        
        if pdf_url:
            logger.info(f"Found PDF URL: {pdf_url}")
            # Update Supabase
            data = {
                "subject_code": subject_code,
                "material_type": "syllabus_pdf",
                "title": f"Official Syllabus PDF - {subject_code}",
                "url": pdf_url,
                "description": "Official GTU Syllabus PDF",
                "author": "GTU"
            }
            # Check if exists
            existing = supabase.table("reference_materials").select("*").eq("subject_code", subject_code).eq("url", pdf_url).execute()
            if not existing.data:
                supabase.table("reference_materials").insert(data).execute()
                logger.info("Inserted PDF link into reference_materials")
            else:
                logger.info("PDF link already exists")
            return pdf_url
        else:
            logger.warning("No PDF link found in search results")
            return None

    except Exception as e:
        logger.error(f"Error scraping PDF: {e}")
        return None

def scrape_gtustudy_materials(subject_code):
    """
    Scrape materials from gtustudy.in
    """
    logger.info(f"Searching for materials on gtustudy.in for subject: {subject_code}")
    try:
        # Try direct URL pattern
        url = f"https://gtustudy.in/{subject_code}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            logger.info(f"Successfully accessed page for {subject_code}")
            
            # Look for download links (this is a placeholder - actual parsing depends on site structure)
            links = soup.find_all('a', href=True)
            material_count = 0
            
            for link in links:
                href = link['href']
                text = link.get_text().strip()
                
                # Look for PDF or material links
                if '.pdf' in href or 'download' in href.lower():
                    # Determine material type from link text
                    material_type = 'notes'
                    if 'question' in text.lower():
                        material_type = 'question_paper'
                    elif 'book' in text.lower():
                        material_type = 'book'
                    
                    # Extract unit if mentioned
                    unit = None
                    for i in range(1, 7):
                        if f'unit {i}' in text.lower() or f'unit-{i}' in text.lower():
                            unit = i
                            break
                    
                    # Insert into appropriate table
                    if material_type == 'notes':
                        data = {
                            "subject_code": subject_code,
                            "unit": unit,
                            "title": text[:200],
                            "file_url": href if href.startswith('http') else f"https://gtustudy.in{href}",
                            "source_url": url,
                            "source_name": "GTUStudy"
                        }
                        try:
                            supabase.table("notes").insert(data).execute()
                            material_count += 1
                            logger.info(f"Inserted note: {text[:50]}")
                        except Exception as e:
                            logger.debug(f"Skipped duplicate or error: {e}")
            
            logger.info(f"Inserted {material_count} materials for {subject_code}")
            return material_count
        else:
            logger.warning(f"Could not access page (status {response.status_code})")
            return 0

    except Exception as e:
        logger.error(f"Error scraping gtustudy.in: {e}")
        return 0

def scrape_gtumaterial(semester=3):
    """
    Scrape materials from gtumaterial.com for a specific semester
    """
    logger.info(f"Scraping GTUMaterial.com for Computer Engineering Semester {semester}")
    try:
        url = f"https://gtumaterial.com/gtu/materials/computer-engineering/semester-{semester}/study%20material"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            logger.info(f"Successfully accessed GTUMaterial page for semester {semester}")
            
            # Find all subject sections (h3 headers with subject codes)
            material_count = 0
            
            # Look for download links
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text().strip()
                
                # GTUMaterial uses Google Drive links
                if 'drive.google.com' in href and text.lower() == 'download':
                    # Get the parent elements to find subject code and book title
                    parent = link.find_parent(['p', 'div', 'li'])
                    if parent:
                        # Try to find subject code in nearby h3
                        subject_header = parent.find_previous('h3')
                        if subject_header:
                            subject_text = subject_header.get_text().strip()
                            # Extract subject code (format: "DS - 3130702" or "DBMS - 3130703")
                            subject_code = None
                            if ' - ' in subject_text:
                                subject_code = subject_text.split(' - ')[-1].strip()
                            
                            # Get book title (text before the Download link)
                            # The parent div contains the book title as text nodes
                            book_title = parent.get_text().replace('Download', '').strip()
                            
                            if subject_code and book_title and len(book_title) > 3:
                                # Insert into reference_materials
                                data = {
                                    "subject_code": subject_code,
                                    "material_type": "book",
                                    "title": book_title[:200],
                                    "url": href,
                                    "source_url": url,
                                    "source_name": "GTUMaterial",
                                    "description": f"Book for {subject_code}"
                                }
                                try:
                                    supabase.table("reference_materials").insert(data).execute()
                                    material_count += 1
                                    logger.info(f"✓ Inserted book: {book_title[:50]} ({subject_code})")
                                except Exception as e:
                                    logger.debug(f"Skipped duplicate: {book_title[:30]}")
            
            logger.info(f"Inserted {material_count} books from GTUMaterial for semester {semester}")
            return material_count
        else:
            logger.warning(f"Could not access GTUMaterial page (status {response.status_code})")
            return 0

    except Exception as e:
        logger.error(f"Error scraping GTUMaterial: {e}")
        return 0

def main():
    logger.info("Starting material scraper...")
    
    # List of subjects to scrape (can be fetched from DB)
    subjects = ["2140701", "3140703"]  # Data Structures, DBMS
    
    for code in subjects:
        logger.info(f"\n{'='*50}\nProcessing subject: {code}\n{'='*50}")
        scrape_gtu_syllabus_pdf(code)
        time.sleep(2)  # Be respectful to servers
        scrape_gtustudy_materials(code)
        time.sleep(2)
    
    # Scrape GTUMaterial for semester 3 (Data Structures, DBMS)
    logger.info(f"\n{'='*50}\nScraping GTUMaterial.com\n{'='*50}")
    scrape_gtumaterial(semester=3)
    
    logger.info("\nScraping completed!")

if __name__ == "__main__":
    main()
