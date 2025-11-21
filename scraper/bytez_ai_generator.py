"""
AI-Powered PDF Generator using Bytez SDK (Correct Implementation)
Uses GPT-2 model via Bytez to generate study content
"""
import os
from bytez import Bytez
from fpdf import FPDF
from supabase import create_client
from dotenv import load_dotenv
import logging
import requests
from bs4 import BeautifulSoup

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
sdk = Bytez(BYTEZ_API_KEY)

def scrape_content(url):
    """Scrape content from educational website"""
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:2000]
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return None

def generate_ai_content(subject_name, unit, scraped_content):
    """Use Bytez AI to generate study notes"""
    try:
        # Use GPT-2 model
        model = sdk.model('openai-community/gpt2')
        
        prompt = f"""Create comprehensive study notes for {subject_name} Unit {unit}.

Include:
1. Key Concepts
2. Important Definitions  
3. Examples
4. Practice Questions

Based on: {scraped_content[:500]}"""

        logger.info(f"  🤖 Generating AI content with Bytez GPT-2...")
        response = model.run(prompt)
        
        if response.error:
            logger.error(f"  ✗ Bytez error: {response.error}")
            return None
        
        content = response.output
        logger.info(f"  ✓ Generated {len(content)} characters")
        return content
        
    except Exception as e:
        logger.error(f"  ✗ Error with Bytez: {e}")
        return None

def create_pdf(subject_name, subject_code, unit, content, output_path):
    """Create PDF using fpdf"""
    try:
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font("Arial", 'B', 20)
        pdf.cell(0, 10, f"{subject_name}", ln=True, align='C')
        
        # Subtitle
        pdf.set_font("Arial", 'I', 12)
        pdf.cell(0, 10, f"Unit {unit} - AI Study Guide", ln=True, align='C')
        pdf.cell(0, 10, f"Subject Code: {subject_code}", ln=True, align='C')
        pdf.ln(10)
        
        # Content
        pdf.set_font("Arial", size=11)
        
        # Clean content - remove problematic Unicode characters
        import re
        clean_content = content
        # Remove common Unicode symbols that cause issues
        clean_content = re.sub(r'[^\x00-\x7F]+', ' ', clean_content)  # Remove non-ASCII
        clean_content = re.sub(r'\s+', ' ', clean_content)  # Normalize whitespace
        
        pdf.multi_cell(0, 6, clean_content)
        
        pdf.output(output_path)
        logger.info(f"  ✓ PDF created: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"  ✗ Error creating PDF: {e}")
        return False

def process_subject(subject_code, subject_name, source_urls):
    """Process subject: scrape, generate AI content, create PDF"""
    logger.info(f"\n{'='*60}")
    logger.info(f"📚 {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    pdf_count = 0
    
    for unit, url in enumerate(source_urls, 1):
        logger.info(f"\n📖 Unit {unit}")
        
        # Scrape content
        scraped = scrape_content(url)
        if not scraped:
            logger.warning(f"  ⚠️  Scraping failed")
            continue
        
        logger.info(f"  ✓ Scraped {len(scraped)} chars from {url[:50]}...")
        
        # Generate AI content
        ai_content = generate_ai_content(subject_name, unit, scraped)
        if not ai_content:
            logger.warning(f"  ⚠️  AI generation failed")
            continue
        
        # Create PDF
        pdf_filename = f"{subject_code}_Unit{unit}_AI.pdf"
        pdf_path = f"/tmp/{pdf_filename}"
        
        if create_pdf(subject_name, subject_code, unit, ai_content, pdf_path):
            pdf_count += 1
            
            # Store in database
            note_data = {
                "subject_code": subject_code,
                "unit": unit,
                "title": f"{subject_name} - Unit {unit} (Bytez AI)",
                "description": f"AI-generated study guide using Bytez GPT-2",
                "file_url": pdf_path,
                "source_url": url,
                "source_name": "Bytez AI"
            }
            
            try:
                supabase.table("notes").insert(note_data).execute()
                logger.info(f"  ✓ Saved to database")
            except:
                logger.debug(f"  Database insert skipped (duplicate)")
            
            logger.info(f"  ✅ Unit {unit} complete!")
    
    return pdf_count

def main():
    logger.info("🚀 Bytez AI PDF Generator")
    logger.info("Using GPT-2 model for content generation\n")
    
    subjects = [
        {
            "code": "2140701",
            "name": "Data Structures",
            "urls": [
                "https://www.tutorialspoint.com/data_structures_algorithms/data_structures_basics.htm",
                "https://www.geeksforgeeks.org/stack-data-structure/",
            ]
        },
        {
            "code": "3140703",
            "name": "Database Management Systems",
            "urls": [
                "https://www.w3schools.com/sql/",
            ]
        }
    ]
    
    total = 0
    for subject in subjects:
        count = process_subject(subject['code'], subject['name'], subject['urls'])
        total += count
    
    logger.info(f"\n{'='*60}")
    logger.info(f"✅ Complete! Generated {total} AI-powered PDFs")
    logger.info(f"{'='*60}")
    logger.info("\n📁 PDFs: /tmp/")
    logger.info("💡 View at: http://localhost:3002/materials/")

if __name__ == "__main__":
    main()
