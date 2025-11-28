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
import json


def fetch_unit_data(subject_code, unit_number):
    """
    Fetch all data for a specific subject and unit from database:
    - Subject details
    - Syllabus points
    - Questions
    - Existing Notes/Materials
    """
    data = {
        "subject": None,
        "syllabus": [],
        "questions": [],
        "notes": []
    }
    
    try:
        # 1. Get Subject
        sub_res = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
        if sub_res.data:
            data["subject"] = sub_res.data[0]
            subject_id = data["subject"]["id"]
            
            # 2. Get Syllabus
            syl_res = supabase.table("syllabus").select("*").eq("subject_id", subject_id).eq("unit_number", unit_number).execute()
            data["syllabus"] = syl_res.data
            
            # 3. Get Questions
            q_res = supabase.table("questions").select("*").eq("subject_id", subject_id).eq("unit_number", unit_number).execute()
            data["questions"] = q_res.data
            
        # 4. Get Notes (using subject_code as per existing schema)
        # We fetch existing notes to use as "scraped data" source
        notes_res = supabase.table("notes").select("*").eq("subject_code", subject_code).eq("unit", unit_number).execute()
        data["notes"] = notes_res.data
        
        return data
    except Exception as e:
        print(f"Error fetching unit data: {e}")
        return data


def synthesize_content_with_ai(data, subject_code, unit_number):
    """
    Use GPT-4o to synthesize multiple sources into a comprehensive study guide
    using the specific prompt template provided.
    """
    subject = data.get("subject", {})
    subject_name = subject.get("subject_name", f"Subject {subject_code}")
    
    syllabus_points = data.get("syllabus", [])
    questions = data.get("questions", [])
    notes = data.get("notes", [])
    
    # Format Syllabus
    syllabus_text = ""
    if syllabus_points:
        for item in syllabus_points:
            syllabus_text += f"- {item.get('unit_title', '')}: {item.get('content', '')}\n"
    else:
        syllabus_text = "No specific syllabus points found."

    # Format Notes (Scraped Data)
    notes_text = ""
    if notes:
        for note in notes:
            notes_text += f"Source: {note.get('source_name', 'Unknown')}\nContent: {note.get('description', '')}\n\n"
    else:
        notes_text = "No specific scraped notes found."

    # Format Questions
    questions_text = ""
    if questions:
        for q in questions:
            questions_text += f"- {q.get('question_text', '')} ({q.get('marks', '')} marks)\n"
    else:
        questions_text = "No specific previous year questions found."

    # Construct the Prompt
    prompt = f"""You are an expert GTU tutor and content writer. Your job is to create a complete, exam-focused study document for GTU students.

CONTEXT:

Subject: {subject_name} (Code: {subject_code})

Unit/Module: {unit_number}

Target level: Explain like I am 10–15 years old first, then add proper technical depth.

Use all the scraped data below to make the notes rich and complete.

SCRAPED DATA (TRUSTED SOURCES):

Official GTU syllabus points:
{syllabus_text}

GTUStudy / GTURanker / other notes:
{notes_text}

Previous year questions and important questions:
{questions_text}

TASK:
Using ONLY the information above (plus your general knowledge for structure and examples), create a single, well-structured study document that a student can directly read as a PDF.

The document MUST include, in order:

Title section
Subject name, subject code, unit number and title.

One-line overview of what this unit is about.

Simple overview (Explain like I am 10–15)
2–3 short paragraphs using simple words and everyday examples.
Answer: “What is this topic?” and “Why should I care in real life?”

Syllabus mapping
Bullet list mapping each official syllabus point to a short explanation.
Make sure every GTU syllabus point is covered.

Detailed theory (exam-focused)
For each major concept in this unit:
Definition.
Step-by-step explanation.
Important properties or rules.
Diagrams described in words (so they can be drawn in notebook).
Pseudo-code or high-level algorithm if relevant (for DS/Algo topics).
Common mistakes or misconceptions students have.

Real-world examples
For each major concept, give at least one real-life or practical example.
Keep examples simple and relatable (school, apps, games, daily life).

Important formulas / key points
Collect all critical formulas, bullet points, and “must-remember” facts.
Mark them clearly as “Key Points for Exams”.

Previous year question coverage
Group previous year questions by topic (from the scraped questions).
For each group, explain briefly how this unit frequently appears in exams.
Provide 3–5 sample answers or answer outlines for the most important questions.

Practice questions (new)
Generate at least:
5 short answer questions.
5 long/8-mark style questions or design problems.
Questions must be directly aligned with the GTU syllabus points.

Summary and revision section
10–15 bullet points summarizing the entire unit.
These should be quick revision notes a student can read just before exam.

Suggested study flow
Suggest a simple plan on how to read this PDF in 2–3 study sessions.

STYLE REQUIREMENTS:
Use clear headings and subheadings for each section.
Use bullet lists wherever it makes information easier to scan.
Do NOT copy text verbatim from sources; rewrite in your own words.
Avoid very long paragraphs; break into smaller chunks for readability.
Make sure all GTU syllabus points from the context are explicitly covered somewhere.
Assume this content will be converted directly into a PDF with minimal formatting changes.
"""

    context = "You are an expert academic writer creating study materials for engineering students."
    
    try:
        synthesized_content = ai_processor.generate_response(prompt, context)
        return synthesized_content
    except Exception as e:
        print(f"Error synthesizing content with AI: {e}")
        return None


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
        # 1. Fetch comprehensive unit data
        data = fetch_unit_data(subject_code, unit_number)
        
        # Check if we have enough data to proceed? 
        # Even if we don't have notes, we might have syllabus/questions.
        # So we proceed if we at least have subject info.
        if not data.get("subject"):
             # Try to proceed with just subject code if subject not found in DB
             pass
        
        # 2. Synthesize content with AI
        synthesized_content = synthesize_content_with_ai(data, subject_code, unit_number)
        
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
        
        # 5. Generate title
        subject_name = data.get("subject", {}).get("subject_name", f'Subject {subject_code}')
        title = f"{subject_name} - Unit {unit_number} Study Guide"
        
        # 6. Create formatted PDF
        sources_count = len(data.get("notes", [])) + len(data.get("syllabus", [])) + len(data.get("questions", []))
        create_formatted_pdf(
            content=synthesized_content,
            title=title,
            subject_code=subject_code,
            unit_number=unit_number,
            sources_count=sources_count,
            file_path=file_path
        )
        
        # 7. For local development, use localhost URL
        # In production, this would be uploaded to Supabase Storage or S3
        if os.getenv('FLASK_ENV') == 'production':
            # Production: would upload to Supabase Storage here
            pdf_url = f"/api/pdf/{filename}"  # Served by backend
        else:
            # Development
            pdf_url = f"http://localhost:5001/api/pdf/{filename}"
        
        # 8. Save metadata to database
        note_data = {
            "subject_code": subject_code,
            "subject_name": subject_name,
            "unit": unit_number,
            "title": title,
            "description": f"AI-generated comprehensive study guide. Covers syllabus, theory, and questions.",
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
            "sources_count": sources_count,
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
