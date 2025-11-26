import os
import requests
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from supabase import create_client
from dotenv import load_dotenv
import logging
from urllib.parse import urljoin
import shutil

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def download_pdf(url, output_path):
    """Download a PDF file from a URL"""
    try:
        response = requests.get(url, stream=True, timeout=30)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                response.raw.decode_content = True
                shutil.copyfileobj(response.raw, f)
            return True
        return False
    except Exception as e:
        logger.error(f"Error downloading PDF {url}: {e}")
        return False

def scrape_content(url):
    """Scrape content or find PDF"""
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 1. Check for PDF links
        pdf_links = []
        for a in soup.find_all('a', href=True):
            if a['href'].lower().endswith('.pdf'):
                pdf_links.append(urljoin(url, a['href']))
        
        if pdf_links:
            # Found a PDF, return it
            return {'type': 'pdf', 'url': pdf_links[0]}
            
        # 2. If no PDF, scrape text
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return {'type': 'text', 'content': text[:5000]}  # Limit to 5000 chars for AI processing
        
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return None

def analyze_with_bytez(content, subject_name):
    """Use Bytez AI to analyze and summarize content"""
    try:
        if not BYTEZ_API_KEY:
            return None
            
        from bytez import Bytez
        client = Bytez(BYTEZ_API_KEY)
        model = client.model("openai/gpt-4o")
        
        prompt = f"""You are an expert educator creating study materials for GTU students.

Subject: {subject_name}

Based on the following content, create a comprehensive study guide with:
1. Key Concepts (bullet points)
2. Important Definitions
3. Examples and Applications
4. Practice Questions (3-5 questions)

Content:
{content[:3000]}

Format your response in clear sections with headers."""

        messages = [
            {"role": "system", "content": "You are an expert educator creating study materials."},
            {"role": "user", "content": prompt}
        ]
        
        # Run model
        result = model.run(messages)
        
        output = result
        # Handle tuple return (output, error)
        if isinstance(result, tuple) and len(result) >= 2:
            output, error = result[0], result[1]
            if error:
                logger.error(f"Bytez API error: {error}")
                return None
        
        # Extract content from output
        if isinstance(output, dict):
            if 'content' in output:
                return output['content']
            elif 'choices' in output and len(output['choices']) > 0:
                return output['choices'][0]['message']['content']
            elif 'text' in output:
                return output['text']
            else:
                logger.warning(f"Unexpected output format: {output}")
                return str(output)
        elif isinstance(output, str):
            return output
        else:
            return str(output)
            
    except Exception as e:
        logger.error(f"Error with Bytez AI: {e}")
        return None

def generate_pdf(subject_name, subject_code, unit, content, output_path):
    """Generate PDF from AI-analyzed content"""
    try:
        doc = SimpleDocTemplate(output_path, pagesize=A4,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        styles.add(ParagraphStyle(name='Justify', alignment=TA_JUSTIFY))
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#1a56db',
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor='#1e40af',
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Add title
        title = Paragraph(f"{subject_name}<br/>Unit {unit} Study Guide", title_style)
        elements.append(title)
        elements.append(Spacer(1, 12))
        
        # Add subject code
        code = Paragraph(f"<b>Subject Code:</b> {subject_code}", styles['Normal'])
        elements.append(code)
        elements.append(Spacer(1, 20))
        
        # Add content sections
        sections = content.split('\n\n')
        for section in sections:
            if section.strip():
                # Check if it's a heading (starts with #, **, or is all caps)
                if section.startswith('#') or section.startswith('**') or section.isupper():
                    clean_section = section.replace('#', '').replace('**', '').strip()
                    para = Paragraph(clean_section, heading_style)
                else:
                    para = Paragraph(section.strip(), styles['Justify'])
                elements.append(para)
                elements.append(Spacer(1, 12))
        
        # Build PDF
        doc.build(elements)
        logger.info(f"✓ PDF generated: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return False

def process_subject(subject_code, subject_name, source_urls):
    """Process a subject: scrape, analyze with AI (or fallback), generate PDF"""
    logger.info(f"\n{'='*60}")
    logger.info(f"📚 Processing: {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    # Ensure directory exists
    os.makedirs("/tmp/gtu_pdfs", exist_ok=True)
    
    for unit, url in enumerate(source_urls, 1):
        logger.info(f"\n📖 Unit {unit}: Scraping from {url}")
        
        # Step 1: Scrape content or find PDF
        result = scrape_content(url)
        if not result:
            logger.warning(f"  ⚠️  Failed to scrape content")
            continue
            
        pdf_filename = f"{subject_code}_Unit{unit}_StudyGuide.pdf"
        pdf_path = f"/tmp/gtu_pdfs/{pdf_filename}"
        source_name = "Scraped Content"
        
        if result['type'] == 'pdf':
            logger.info(f"  📄 Found existing PDF: {result['url']}")
            if download_pdf(result['url'], pdf_path):
                logger.info(f"  ✓ Downloaded PDF")
                source_name = "Official PDF"
            else:
                logger.warning("  ⚠️  Failed to download PDF, skipping unit")
                continue
        else:
            # Text content
            content = result['content']
            logger.info(f"  ✓ Scraped {len(content)} characters (Text)")
            
            # Step 2: Analyze with Bytez AI (or Fallback)
            ai_content = None
            
            if BYTEZ_API_KEY and BYTEZ_API_KEY != "your_bytez_key_here":
                logger.info(f"  🤖 Analyzing with Bytez AI...")
                ai_content = analyze_with_bytez(content, f"{subject_name} - Unit {unit}")
                if ai_content:
                    source_name = "AI Generated (Bytez)"
                else:
                    logger.warning(f"  ⚠️  AI analysis failed, falling back to raw content")
            else:
                logger.info(f"  ℹ️  Bytez API key missing/invalid. Using raw content.")
            
            # Fallback to raw content if AI failed or key missing
            if not ai_content:
                ai_content = f"""# {subject_name} - Unit {unit}
                
                ## Study Material
                
                {content}
                
                *(Note: This content was scraped directly from {url} because AI summarization is currently unavailable)*
                """
            
            # Step 3: Generate PDF
            logger.info(f"  📄 Generating PDF...")
            if not generate_pdf(subject_name, subject_code, unit, ai_content, pdf_path):
                continue
            
        # Step 4: Store in database
        note_data = {
            "subject_code": subject_code,
            "unit": unit,
            "title": f"{subject_name} - Unit {unit} Study Guide",
            "description": f"Study guide for Unit {unit} from {url}",
            "file_url": f"/api/pdf/{pdf_filename}",  # URL to serve the PDF
            "source_url": url,
            "source_name": source_name,
            "created_at": "now()"
        }
        
        try:
            # Check if exists first to avoid duplicates (optional, but good practice)
            # For now, just insert/upsert logic if possible, or just insert
            supabase.table("notes").insert(note_data).execute()
            logger.info(f"  ✓ Stored in database")
        except Exception as e:
            logger.warning(f"  ⚠️  Database insert failed (may be duplicate): {e}")
    
    logger.info(f"  ✅ Subject {subject_code} complete!")

def get_all_subjects():
    """Fetch all subjects from Supabase"""
    try:
        response = supabase.table("subjects").select("subject_code, subject_name").execute()
        if response.data:
            return response.data
        return []
    except Exception as e:
        logger.error(f"Error fetching subjects: {e}")
        return []

def main():
    """Main execution"""
    logger.info("🚀 GTU Content Seeder & PDF Generator Starting...")
    
    if not BYTEZ_API_KEY or BYTEZ_API_KEY == "your_bytez_key_here":
        logger.warning("⚠️  BYTEZ_API_KEY not found or invalid. Running in FALLBACK mode (Raw Text).")
    else:
        logger.info("✨ AI Mode Enabled (Bytez API)")
    
    # 1. Fetch subjects from DB
    db_subjects = get_all_subjects()
    
    # 2. Define default sources (Legitimate Educational Sites)
    default_sources = [
        "https://www.geeksforgeeks.org/computer-science-tutorials/",
        "https://www.tutorialspoint.com/computer_fundamentals/index.htm",
        "https://www.javatpoint.com/computer-fundamentals-tutorial"
    ]
    
    # Map specific subjects to specific URLs if known, otherwise use defaults
    # This is a simplified mapping. In a real scraper, we'd search for the subject name.
    subject_map = {
        "Database Management Systems": [
            "https://www.javatpoint.com/dbms-tutorial",
            "https://www.geeksforgeeks.org/dbms/",
            "https://www.tutorialspoint.com/dbms/index.htm"
        ],
        "Operating System": [
            "https://www.javatpoint.com/os-tutorial",
            "https://www.geeksforgeeks.org/operating-systems/",
            "https://www.tutorialspoint.com/operating_system/index.htm"
        ],
        "Data Structures": [
            "https://www.javatpoint.com/data-structure-tutorial",
            "https://www.geeksforgeeks.org/data-structures/",
            "https://www.programiz.com/dsa"
        ]
    }
    
    subjects_to_process = []
    if db_subjects:
        for s in db_subjects:
            urls = subject_map.get(s['subject_name'], default_sources)
            subjects_to_process.append({
                "code": s['subject_code'],
                "name": s['subject_name'],
                "urls": urls
            })
    else:
        # Fallback to hardcoded if DB empty
        logger.warning("No subjects found in DB, using hardcoded list.")
        subjects_to_process = [
            {
                "code": "3140703",
                "name": "Database Management Systems",
                "urls": subject_map["Database Management Systems"]
            }
        ]
    
    for subject in subjects_to_process:
        process_subject(subject['code'], subject['name'], subject['urls'])
    
    logger.info("\n" + "="*60)
    logger.info("✅ Seeding Complete!")
    logger.info("="*60)

if __name__ == "__main__":
    main()
