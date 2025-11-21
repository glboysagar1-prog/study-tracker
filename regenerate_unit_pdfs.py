import os
import time
import logging
from dotenv import load_dotenv
from supabase import create_client
from fpdf import FPDF
from bytez import Bytez

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BYTEZ_API_KEY = os.getenv("BYTEZ_API_KEY")

# Initialize clients
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
sdk = Bytez(BYTEZ_API_KEY)

class UnitPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'GTU Study Guide (AI Generated)', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_ai_content(topic):
    """Generate content for the topic using GPT-4o"""
    try:
        model = sdk.model("openai/gpt-4o")
        messages = [{
            "role": "user",
            "content": f"Explain '{topic}' in detail for engineering students. Include definition, key concepts, and an example."
        }]
        response = model.run(messages)
        
        output = response.output
        if isinstance(output, dict):
            if 'content' in output: output = output['content']
            elif 'text' in output: output = output['text']
            else: output = str(output)
        return output
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        return f"Content generation failed for {topic}. Please try again later."

def regenerate_pdfs(subject_code):
    logger.info(f"Fetching notes for subject {subject_code}...")
    
    # Fetch notes with file_url pointing to our API
    response = supabase.table("notes")\
        .select("*")\
        .eq("subject_code", subject_code)\
        .ilike("file_url", "%/api/pdf/%")\
        .execute()
        
    notes = response.data
    if not notes:
        logger.info("No PDF notes found to regenerate.")
        return

    for note in notes:
        file_url = note['file_url']
        filename = file_url.split('/')[-1]
        filepath = f"/tmp/{filename}"
        
        logger.info(f"Regenerating {filename} for '{note['title']}'...")
        
        # Generate Content
        content = generate_ai_content(note['title'])
        
        # Create PDF
        pdf = UnitPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font('Arial', 'B', 18)
        pdf.set_text_color(0, 51, 102)
        pdf.multi_cell(0, 10, note['title'], 0, 'C')
        pdf.ln(10)
        
        # Content
        pdf.set_font('Arial', '', 12)
        pdf.set_text_color(0, 0, 0)
        
        # Clean content
        import re
        clean_content = re.sub(r'[^\x00-\x7F]+', ' ', content)
        pdf.multi_cell(0, 7, clean_content)
        
        # Save
        pdf.output(filepath)
        logger.info(f"✅ Saved to {filepath}")
        
        # Rate limit
        time.sleep(1)

if __name__ == "__main__":
    regenerate_pdfs("2140701")
