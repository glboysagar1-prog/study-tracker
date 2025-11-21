"""
AI-Powered PDF Generator using Bytez
Scrapes content, uses AI to analyze and summarize, generates PDFs
"""
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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_content(url):
    """Scrape content from educational website"""
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text[:5000]  # Limit to 5000 chars for AI processing
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return None

def analyze_with_bytez(content, subject_name):
    """Use Bytez AI to analyze and summarize content"""
    try:
        url = "https://api.bytez.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {BYTEZ_API_KEY}",
            "Content-Type": "application/json"
        }
        
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

        payload = {
            "model": "gpt-4o",
            "messages": [
                {"role": "system", "content": "You are an expert educator creating study materials."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2000,
            "temperature": 0.7
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content']
        else:
            logger.error(f"Bytez API error: {response.status_code} - {response.text}")
            return None
            
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
    """Process a subject: scrape, analyze with AI, generate PDF"""
    logger.info(f"\n{'='*60}")
    logger.info(f"📚 Processing: {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    for unit, url in enumerate(source_urls, 1):
        logger.info(f"\n📖 Unit {unit}: Scraping from {url}")
        
        # Step 1: Scrape content
        content = scrape_content(url)
        if not content:
            logger.warning(f"  ⚠️  Failed to scrape content")
            continue
        
        logger.info(f"  ✓ Scraped {len(content)} characters")
        
        # Step 2: Analyze with Bytez AI
        logger.info(f"  🤖 Analyzing with Bytez AI...")
        ai_content = analyze_with_bytez(content, f"{subject_name} - Unit {unit}")
        
        if not ai_content:
            logger.warning(f"  ⚠️  AI analysis failed")
            continue
        
        logger.info(f"  ✓ AI analysis complete ({len(ai_content)} characters)")
        
        # Step 3: Generate PDF
        pdf_filename = f"{subject_code}_Unit{unit}_StudyGuide.pdf"
        pdf_path = f"/tmp/{pdf_filename}"
        
        logger.info(f"  📄 Generating PDF...")
        if generate_pdf(subject_name, subject_code, unit, ai_content, pdf_path):
            
            # Step 4: Store in database
            note_data = {
                "subject_code": subject_code,
                "unit": unit,
                "title": f"{subject_name} - Unit {unit} Study Guide (AI Generated)",
                "description": f"Comprehensive study guide generated by AI from {url}",
                "file_url": pdf_path,  # In production, upload to cloud storage
                "source_url": url,
                "source_name": "AI Generated (Bytez)"
            }
            
            try:
                supabase.table("notes").insert(note_data).execute()
                logger.info(f"  ✓ Stored in database")
            except Exception as e:
                logger.warning(f"  ⚠️  Database insert failed (may be duplicate): {e}")
        
        logger.info(f"  ✅ Unit {unit} complete!")

def main():
    """Main execution"""
    logger.info("🚀 AI-Powered PDF Generator Starting...")
    logger.info("Using Bytez AI for content analysis\n")
    
    # Define subjects and their source URLs
    subjects = [
        {
            "code": "2140701",
            "name": "Data Structures",
            "urls": [
                "https://www.tutorialspoint.com/data_structures_algorithms/data_structures_basics.htm",
                "https://www.geeksforgeeks.org/stack-data-structure/",
                "https://www.programiz.com/dsa/linked-list"
            ]
        },
        {
            "code": "3140703",
            "name": "Database Management Systems",
            "urls": [
                "https://www.javatpoint.com/dbms-tutorial",
                "https://www.w3schools.com/sql/",
                "https://www.studytonight.com/dbms/database-normalization.php"
            ]
        }
    ]
    
    for subject in subjects:
        process_subject(subject['code'], subject['name'], subject['urls'])
    
    logger.info("\n" + "="*60)
    logger.info("✅ PDF Generation Complete!")
    logger.info("="*60)
    logger.info("\n📌 Generated PDFs are stored in /tmp/")
    logger.info("💡 In production, upload these to cloud storage (S3, Google Drive, etc.)")

if __name__ == "__main__":
    main()
