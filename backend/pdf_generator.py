"""
PDF Generator Module for GTU Exam Prep
Generates AI-powered comprehensive study guides from scraped content
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from backend.supabase_client import supabase
from backend.ai import ai_processor
import hashlib


def fetch_unit_notes(subject_code, unit_number):
    """
    Fetch all notes for a specific subject and unit from database
    """
    try:
        response = supabase.table("notes").select("*").eq("subject_code", subject_code).eq("unit", unit_number).execute()
        return response.data if response.data else []
    except Exception as e:
        print(f"Error fetching notes: {e}")
        return []


def synthesize_content_with_ai(notes, subject_code, unit_number):
    """
    Use GPT-4o to synthesize multiple notes into a comprehensive study guide
    """
    if not notes:
        return None
    
    # Prepare context from all notes
    sources = []
    for note in notes:
        sources.append(f"Title: {note.get('title', 'Untitled')}\nContent: {note.get('description', '')}\nSource: {note.get('source_name', 'Unknown')}")
    
    combined_content = "\n\n---\n\n".join(sources)
    
    prompt = f"""You are an expert academic content synthesizer. Create a comprehensive, well-structured study guide for Subject Code {subject_code}, Unit {unit_number}.

I have collected the following notes from multiple sources:

{combined_content[:4000]}  

Please synthesize this information into a cohesive, comprehensive study guide with:
1. A clear introduction to the unit topic
2. Main concepts organized into logical sections with headings
3. Detailed explanations with examples where applicable
4. Key points and takeaways
5. Important formulas or algorithms (if applicable)

Format the output using clear markdown-style headings (# for main sections, ## for subsections).
Make it detailed (aim for 800-1200 words) but well-organized and easy to understand for students."""

    context = "You are an expert academic writer creating study materials for engineering students."
    
    try:
        synthesized_content = ai_processor.generate_response(prompt, context)
        return synthesized_content
    except Exception as e:
        print(f"Error synthesizing content with AI: {e}")
        # Fallback: just combine the descriptions
        return "\n\n".join([f"**{note.get('title')}**\n{note.get('description', '')}" for note in notes])


def create_formatted_pdf(content, title, subject_code, unit_number, sources_count, file_path):
    """
    Create a well-formatted PDF from markdown-style content
    """
    doc = SimpleDocTemplate(file_path, pagesize=letter,
                            rightMargin=72, leftMargin=72,
                            topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.gray,
        spaceAfter=20,
        alignment=TA_CENTER
    )
    
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#3b82f6'),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=11,
        alignment=TA_JUSTIFY,
        spaceAfter=12,
        leading=16
    )
    
    # Title page
    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph(title, title_style))
    elements.append(Paragraph(f"Subject Code: {subject_code} | Unit {unit_number}", subtitle_style))
    elements.append(Paragraph(f"Compiled from {sources_count} source(s)", subtitle_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", subtitle_style))
    elements.append(Spacer(1, 0.5*inch))
    
    # AI attribution
    ai_text = Paragraph(
        "<i>This study guide was generated using AI to synthesize content from multiple educational sources.</i>",
        subtitle_style
    )
    elements.append(ai_text)
    elements.append(PageBreak())
    
    # Process content - convert markdown-style to PDF
    lines = content.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            elements.append(Spacer(1, 0.1*inch))
            continue
            
        # Main headings (# Heading)
        if line.startswith('# '):
            heading_text = line[2:].strip()
            elements.append(Paragraph(heading_text, heading1_style))
            
        # Subheadings (## Subheading)
        elif line.startswith('## '):
            heading_text = line[3:].strip()
            elements.append(Paragraph(heading_text, heading2_style))
            
        # Bullet points
        elif line.startswith('- ') or line.startswith('* '):
            bullet_text = line[2:].strip()
            elements.append(Paragraph(f"• {bullet_text}", body_style))
            
        # Numbered lists
        elif line and line[0].isdigit() and '. ' in line:
            elements.append(Paragraph(line, body_style))
            
        # Bold text
        elif line.startswith('**') and line.endswith('**'):
            bold_text = line[2:-2]
            elements.append(Paragraph(f"<b>{bold_text}</b>", body_style))
            
        # Regular paragraph
        else:
            elements.append(Paragraph(line, body_style))
    
    # Build PDF
    doc.build(elements)
    return file_path


def generate_unit_pdf(subject_code, unit_number):
    """
    Main function to generate a comprehensive PDF for a subject unit
    Returns: dict with success status, pdf_url, title, and metadata
    """
    try:
        # 1. Fetch notes
        notes = fetch_unit_notes(subject_code, unit_number)
        
        if not notes or len(notes) == 0:
            return {
                "success": False,
                "error": "No notes found for this subject and unit"
            }
        
        # 2. Synthesize content with AI
        synthesized_content = synthesize_content_with_ai(notes, subject_code, unit_number)
        
        if not synthesized_content:
            return {
                "success": False,
                "error": "Failed to synthesize content"
            }
        
        # 3. Generate a unique filename
        content_hash = hashlib.md5(f"{subject_code}_{unit_number}_{datetime.now().date()}".encode()).hexdigest()[:8]
        filename = f"unit_guide_{subject_code}_unit{unit_number}_{content_hash}.pdf"
        
        # 4. Create PDF directory if it doesn't exist
        pdf_dir = "/tmp/gtu_pdfs"
        os.makedirs(pdf_dir, exist_ok=True)
        file_path = os.path.join(pdf_dir, filename)
        
        # 5. Generate title from first note
        title = notes[0].get('subject_name', f'Subject {subject_code}') + f" - Unit {unit_number} Study Guide"
        
        # 6. Create formatted PDF
        create_formatted_pdf(
            content=synthesized_content,
            title=title,
            subject_code=subject_code,
            unit_number=unit_number,
            sources_count=len(notes),
            file_path=file_path
        )
        
        # 7. For local development, use localhost URL
        # In production, this would be uploaded to Supabase Storage or S3
        if os.getenv('FLASK_ENV') == 'production':
            # Production: would upload to Supabase Storage here
            pdf_url = f"/api/pdf/{filename}"  # Served by backend
        else:
            # Development
            pdf_url = f"http://localhost:5000/api/pdf/{filename}"
        
        # 8. Save metadata to database
        note_data = {
            "subject_code": subject_code,
            "subject_name": notes[0].get('subject_name', f'Subject {subject_code}'),
            "unit": unit_number,
            "title": title,
            "description": f"AI-generated comprehensive study guide compiled from {len(notes)} sources",
            "file_url": pdf_url,
            "source_url": pdf_url,
            "source_name": "AI-Generated (GTU Exam Prep)",
            "is_verified": True,
            "downloads": 0,
            "views": 0
        }
        
        # Check if AI-generated guide already exists
        existing = supabase.table("notes").select("id").eq("subject_code", subject_code).eq("unit", unit_number).eq("source_name", "AI-Generated (GTU Exam Prep)").execute()
        
        if existing.data:
            # Update existing
            supabase.table("notes").update(note_data).eq("id", existing.data[0]['id']).execute()
        else:
            # Insert new
            supabase.table("notes").insert(note_data).execute()
        
        return {
            "success": True,
            "pdf_url": pdf_url,
            "title": title,
            "sources_count": len(notes),
            "filename": filename,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Error generating PDF: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }
