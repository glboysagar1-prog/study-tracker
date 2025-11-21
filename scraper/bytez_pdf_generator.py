"""
AI-Powered PDF Generator using Bytez Python SDK
Scrapes content, uses Bytez AI to analyze and summarize, generates PDFs
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
from bytez import Bytez
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
bytez_sdk = Bytez(BYTEZ_API_KEY)

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
        
        return text[:4000]  # Limit for AI processing
    except Exception as e:
        logger.error(f"Error scraping {url}: {e}")
        return None

def analyze_with_bytez(content, subject_name, unit):
    """Use Bytez AI (GPT-4) to analyze and create study guide"""
    try:
        # Use GPT-4 model via Bytez
        model = bytez_sdk.model("openai/gpt-4")
        
        prompt = f"""You are an expert educator creating study materials for GTU (Gujarat Technological University) students.

Subject: {subject_name} - Unit {unit}

Based on the following content, create a comprehensive, well-structured study guide with:

1. **Key Concepts** (5-7 main points)
2. **Important Definitions** (3-5 definitions)
3. **Detailed Explanations** (2-3 paragraphs)
4. **Examples and Applications** (2-3 real-world examples)
5. **Practice Questions** (5 questions with varying difficulty)

Content to analyze:
{content[:3000]}

Format your response with clear section headers using ** for bold text.
Make it comprehensive but concise, suitable for exam preparation."""

        # Run the model
        result = model.run(prompt)
        
        # Handle Bytez Response object
        if hasattr(result, 'output'):
            output = result.output
            if output:
                logger.info(f"  ✓ AI analysis complete ({len(output)} characters)")
                return output
        elif hasattr(result, 'error'):
            logger.error(f"Bytez AI error: {result.error}")
            return None
        else:
            logger.error(f"Bytez AI returned unexpected format: {type(result)}")
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
        
        subtitle = Paragraph(f"Unit {unit} - AI-Generated Study Guide<br/>Subject Code: {subject_code}", subtitle_style)
        elements.append(subtitle)
        elements.append(Spacer(1, 30))
        
        # Add AI-generated content
        sections = content.split('\n\n')
        for section in sections:
            if section.strip():
                # Check if it's a heading (contains **)
                if '**' in section:
                    clean_section = section.replace('**', '').strip()
                    para = Paragraph(clean_section, heading_style)
                else:
                    para = Paragraph(section.strip(), styles['BodyText'])
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
    """Process a subject: scrape, analyze with Bytez AI, generate PDF"""
    logger.info(f"\n{'='*60}")
    logger.info(f"📚 Processing: {subject_name} ({subject_code})")
    logger.info(f"{'='*60}")
    
    pdf_count = 0
    
    for unit, url in enumerate(source_urls, 1):
        logger.info(f"\n📖 Unit {unit}: Scraping from {url}")
        
        # Step 1: Scrape content
        content = scrape_content(url)
        if not content:
            logger.warning(f"  ⚠️  Failed to scrape content")
            continue
        
        logger.info(f"  ✓ Scraped {len(content)} characters")
        
        # Step 2: Analyze with Bytez AI
        logger.info(f"  🤖 Analyzing with Bytez AI (GPT-4)...")
        ai_content = analyze_with_bytez(content, subject_name, unit)
        
        if not ai_content:
            logger.warning(f"  ⚠️  AI analysis failed, skipping...")
            continue
        
        # Step 3: Generate PDF
        pdf_filename = f"{subject_code}_Unit{unit}_AI_StudyGuide.pdf"
        pdf_path = f"/tmp/{pdf_filename}"
        
        logger.info(f"  📄 Generating PDF...")
        if generate_pdf(subject_name, subject_code, unit, ai_content, pdf_path):
            pdf_count += 1
            
            # Step 4: Store in database
            note_data = {
                "subject_code": subject_code,
                "unit": unit,
                "title": f"{subject_name} - Unit {unit} AI Study Guide",
                "description": f"AI-generated comprehensive study guide using Bytez GPT-4",
                "file_url": pdf_path,
                "source_url": url,
                "source_name": "Bytez AI (GPT-4)"
            }
            
            try:
                supabase.table("notes").insert(note_data).execute()
                logger.info(f"  ✓ Stored in database")
            except Exception as e:
                logger.debug(f"  Database insert skipped: {str(e)[:50]}")
        
        logger.info(f"  ✅ Unit {unit} complete!")
    
    return pdf_count

def main():
    """Main execution"""
    logger.info("🚀 AI-Powered PDF Generator Starting...")
    logger.info("Using Bytez SDK with GPT-4 for content analysis\n")
    
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
    
    total_pdfs = 0
    for subject in subjects:
        count = process_subject(subject['code'], subject['name'], subject['urls'])
        total_pdfs += count
    
    logger.info("\n" + "="*60)
    logger.info(f"✅ AI PDF Generation Complete! Generated {total_pdfs} PDFs")
    logger.info("="*60)
    logger.info("\n📁 PDFs saved to: /tmp/")
    logger.info("💡 View them in your app at http://localhost:3002/materials/")

if __name__ == "__main__":
    main()
