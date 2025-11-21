"""
Enhanced AI PDF Generator using Bytez GPT-4o
Creates comprehensive, easy-to-understand study guides
"""
import os
import re
import time
from bytez import Bytez
from fpdf import FPDF
from supabase import create_client
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

sdk = Bytez(BYTEZ_API_KEY)
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

class StudyNotesPDF(FPDF):
    def __init__(self, subject_name):
        super().__init__()
        self.subject_name = subject_name
    
    def header(self):
        self.set_font('Arial', 'B', 18)
        self.set_text_color(0, 102, 204)
        self.cell(0, 12, self.subject_name, 0, 1, 'C')
        self.set_text_color(0, 0, 0)
        self.ln(3)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 9)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
    
    def add_unit_title(self, unit_num, title):
        self.add_page()
        self.set_font('Arial', 'B', 16)
        self.set_fill_color(230, 245, 255)
        self.cell(0, 12, f'Unit {unit_num}: {title}', 0, 1, 'L', True)
        self.ln(5)
    
    def add_section(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(51, 102, 153)
        self.cell(0, 10, title, 0, 1, 'L')
        self.set_text_color(0, 0, 0)
        self.ln(2)
    
    def add_content(self, content):
        self.set_font('Arial', '', 11)
        # Clean Unicode
        clean = re.sub(r'[^\x00-\x7F]+', ' ', content)
        clean = re.sub(r'\s+', ' ', clean)
        self.multi_cell(0, 7, clean)
        self.ln(3)
    
    def add_highlight(self, content, color=(255, 255, 200)):
        self.set_font('Arial', 'I', 11)
        self.set_fill_color(*color)
        clean = re.sub(r'[^\x00-\x7F]+', ' ', content)
        self.multi_cell(0, 7, clean, 0, 'L', True)
        self.ln(3)

def generate_ai_content(topic, unit_num):
    """Generate content using GPT-4o"""
    model = sdk.model("openai/gpt-4o")
    
    messages = [{
        "role": "user",
        "content": f"""Create a comprehensive study guide for GTU students on: {topic} (Unit {unit_num})

Provide:
1. EXPLANATION: Clear explanation in 2-3 paragraphs with examples
2. KEY POINTS: 5-7 important bullet points
3. EXAMPLE: One detailed real-world example
4. PRACTICE: 3 practice questions

Format with clear section headers."""
    }]
    
    logger.info(f"  🤖 Generating AI content with GPT-4o...")
    response = model.run(messages)
    
    if response.error:
        logger.error(f"  ✗ Error: {response.error}")
        return None
    
    # Handle response - could be dict or string
    output = response.output
    if isinstance(output, dict):
        # Extract content from dict response
        if 'content' in output:
            output = output['content']
        elif 'text' in output:
            output = output['text']
        else:
            output = str(output)
    
    logger.info(f"  ✓ Generated {len(output)} characters")
    return output

def parse_content(content):
    """Parse AI response into sections"""
    sections = {}
    current_section = None
    current_content = []
    
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # Check for section headers
        if any(keyword in line.upper() for keyword in ['EXPLANATION', 'KEY POINTS', 'EXAMPLE', 'PRACTICE']):
            if current_section:
                sections[current_section] = '\n'.join(current_content)
            current_section = line
            current_content = []
        else:
            current_content.append(line)
    
    if current_section:
        sections[current_section] = '\n'.join(current_content)
    
    return sections

def create_study_pdf(subject_code, subject_name, units):
    """
    Create comprehensive PDF for a subject
    
    Args:
        subject_code: e.g., "2140701"
        subject_name: e.g., "Data Structures"
        units: List of unit topics, e.g., ["Arrays", "Stacks", "Queues"]
    """
    pdf = StudyNotesPDF(subject_name)
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Cover page
    pdf.add_page()
    pdf.set_font('Arial', 'B', 24)
    pdf.ln(60)
    pdf.cell(0, 15, subject_name, 0, 1, 'C')
    pdf.set_font('Arial', '', 14)
    pdf.cell(0, 10, 'AI-Generated Study Guide', 0, 1, 'C')
    pdf.set_font('Arial', 'I', 12)
    pdf.ln(10)
    pdf.cell(0, 10, f'Subject Code: {subject_code}', 0, 1, 'C')
    pdf.cell(0, 10, 'Powered by GPT-4o', 0, 1, 'C')
    
    # Generate content for each unit
    for unit_num, topic in enumerate(units, 1):
        logger.info(f"\n📖 Unit {unit_num}: {topic}")
        pdf.add_unit_title(unit_num, topic)
        
        # Generate AI content
        ai_content = generate_ai_content(topic, unit_num)
        
        if ai_content:
            sections = parse_content(ai_content)
            
            for section_title, section_content in sections.items():
                if section_content.strip():
                    pdf.add_section(section_title)
                    
                    # Highlight key points
                    if 'KEY POINTS' in section_title.upper():
                        pdf.add_highlight(section_content, (255, 255, 200))
                    elif 'EXAMPLE' in section_title.upper():
                        pdf.add_highlight(section_content, (240, 255, 240))
                    else:
                        pdf.add_content(section_content)
        else:
            pdf.add_content("Content generation failed. Please try again.")
        
        # Rate limit
        time.sleep(2)
    
    # Save PDF
    filename = f"/tmp/{subject_code}_GPT4o_Study_Guide.pdf"
    pdf.output(filename)
    logger.info(f"\n✅ PDF created: {filename}")
    
    # Store in database
    note_data = {
        "subject_code": subject_code,
        "unit": None,
        "title": f"{subject_name} - Complete Study Guide (GPT-4o)",
        "description": f"Comprehensive AI-generated study guide covering {len(units)} units",
        "file_url": filename,
        "source_name": "Bytez GPT-4o"
    }
    
    try:
        supabase.table("notes").insert(note_data).execute()
        logger.info("✓ Saved to database")
    except:
        logger.debug("Database insert skipped")
    
    return filename

def main():
    logger.info("🚀 GPT-4o PDF Generator")
    logger.info("Creating comprehensive study guides\n")
    
    # Data Structures
    create_study_pdf(
        "2140701",
        "Data Structures",
        ["Arrays and Pointers", "Stacks and Queues", "Linked Lists"]
    )
    
    # DBMS
    create_study_pdf(
        "3140703",
        "Database Management Systems",
        ["Introduction to DBMS", "Relational Model and SQL"]
    )
    
    logger.info("\n" + "="*60)
    logger.info("✅ All PDFs generated successfully!")
    logger.info("="*60)
    logger.info("\n📁 Location: /tmp/")
    logger.info("💡 View at: http://localhost:3002/materials/")

if __name__ == "__main__":
    main()
