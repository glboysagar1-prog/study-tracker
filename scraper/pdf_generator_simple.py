"""
AI-Powered PDF Generator (Fallback without Bytez)
Scrapes content and generates comprehensive study PDFs
"""
import os
import requests
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from supabase import create_client
from dotenv import load_dotenv
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def scrape_and_structure_content(url):
    """Scrape and intelligently structure content"""
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()
        
        structured_content = {
            'title': '',
            'sections': []
        }
        
        # Get title
        title_tag = soup.find('h1') or soup.find('title')
        if title_tag:
            structured_content['title'] = title_tag.get_text().strip()
        
        # Get main content sections
        for heading in soup.find_all(['h2', 'h3']):
            section = {
                'heading': heading.get_text().strip(),
                'content': []
            }
            
            # Get content after heading
            for sibling in heading.find_next_siblings():
                if sibling.name in ['h2', 'h3']:
                    break
                if sibling.name == 'p':
                    text = sibling.get_text().strip()
                    if text:
                        section['content'].append(text)
                elif sibling.name in ['ul', 'ol']:
                    items = [li.get_text().strip() for li in sibling.find_all('li')]
                    section['content'].extend([f"• {item}" for item in items if item])
            
            if section['content']:
                structured_content['sections'].append(section)
        
        return structured_content
        
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return None

def generate_pdf(subject_name, subject_code, unit, content_data, output_path):
    """Generate professional PDF from structured content"""
    try:
        doc = SimpleDocTemplate(output_path, pagesize=A4,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor='#1a56db',
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor='#6b7280',
            spaceAfter=20,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor='#1e40af',
            spaceAfter=12,
            spaceBefore=16
        )
        
        # Title page
        title = Paragraph(f"{subject_name}", title_style)
        elements.append(title)
        
        subtitle = Paragraph(f"Unit {unit} Study Guide<br/>Subject Code: {subject_code}", subtitle_style)
        elements.append(subtitle)
        elements.append(Spacer(1, 30))
        
        # Add content sections
        if content_data and 'sections' in content_data:
            for section in content_data['sections'][:10]:  # Limit to 10 sections
                # Section heading
                heading = Paragraph(section['heading'], heading_style)
                elements.append(heading)
                
                # Section content
                for paragraph in section['content'][:5]:  # Limit paragraphs per section
                    if len(paragraph) > 20:  # Skip very short lines
                        para = Paragraph(paragraph, styles['BodyText'])
                        elements.append(para)
                        elements.append(Spacer(1, 8))
                
                elements.append(Spacer(1, 12))
        
        # Build PDF
        doc.build(elements)
        logger.info(f"✓ PDF generated: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"Error generating PDF: {e}")
        return False

def process_subject(subject_code, subject_name, source_urls):
    """Process a subject: scrape and generate PDF"""
    logger.info(f"\n{'='*60}")
    logger.info(f"📚 Processing: {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    pdf_count = 0
    
    for unit, url in enumerate(source_urls, 1):
        logger.info(f"\n📖 Unit {unit}: Processing {url}")
        
        # Scrape and structure content
        content = scrape_and_structure_content(url)
        if not content or not content.get('sections'):
            logger.warning(f"  ⚠️  No structured content found")
            continue
        
        logger.info(f"  ✓ Found {len(content['sections'])} sections")
        
        # Generate PDF
        pdf_filename = f"{subject_code}_Unit{unit}_StudyGuide.pdf"
        pdf_path = f"/tmp/{pdf_filename}"
        
        logger.info(f"  📄 Generating PDF...")
        if generate_pdf(subject_name, subject_code, unit, content, pdf_path):
            pdf_count += 1
            
            # Store in database
            note_data = {
                "subject_code": subject_code,
                "unit": unit,
                "title": f"{subject_name} - Unit {unit} Study Guide",
                "description": f"Comprehensive study guide from {content.get('title', 'educational source')}",
                "file_url": pdf_path,
                "source_url": url,
                "source_name": "Auto-Generated PDF"
            }
            
            try:
                supabase.table("notes").insert(note_data).execute()
                logger.info(f"  ✓ Stored in database")
            except Exception as e:
                logger.debug(f"  Database insert skipped (duplicate): {str(e)[:50]}")
            
            logger.info(f"  ✅ Unit {unit} complete!")
    
    return pdf_count

def main():
    """Main execution"""
    logger.info("🚀 PDF Generator Starting...")
    logger.info("Scraping educational content and generating study guides\n")
    
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
                "https://www.w3schools.com/sql/",
                "https://www.studytonight.com/dbms/database-normalization.php"
            ]
        }
    ]
    
    total_pdfs = 0
    for subject in subjects:
        count = process_subject(subject['code'], subject['name'], subject['urls'])
        total_pdfs += count
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ PDF Generation Complete! Generated {total_pdfs} PDFs")
    logger.info("="*60)
    logger.info("\n📁 PDFs saved to: /tmp/")
    logger.info("💡 Check your app to view the new study guides!")

if __name__ == "__main__":
    main()
