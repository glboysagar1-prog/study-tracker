import os
import json
import time
from datetime import datetime

# Try to import Bytez, but make it optional
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False
    Bytez = None

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    OpenAI = None

# Google Gemini removed as per user request
GOOGLE_AVAILABLE = False
genai = None

from fpdf import FPDF
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
import requests
from youtube_transcript_api import YouTubeTranscriptApi
import re

load_dotenv()

# ==================== ENHANCED AI AGENT ====================

class EnhancedGTUAgent:
    """
    Advanced AI Agent with video summarization, flashcards, voice, and more
    """
    
    def __init__(self, bytez_key=None, google_key=None, lightning_key=None, supabase_url=None, supabase_key=None):
        # Initialize Bytez if available
        self.sdk = None
        self.llm = None
        self.gemini_model = None
        self.lightning_client = None
        
        # 0. Try Lightning AI (Primary as per user request)
        lightning_key = lightning_key or os.getenv("LIGHTNING_API_KEY")
        if lightning_key and OPENAI_AVAILABLE:
            try:
                self.lightning_client = OpenAI(
                    api_key=lightning_key,
                    base_url="https://lightning.ai/api/v1"
                )
                print("✓ Lightning AI initialized")
            except Exception as e:
                print(f"✗ Lightning AI initialization failed: {e}")

        # 1. Try Bytez first (Secondary)
        if not self.lightning_client and BYTEZ_AVAILABLE and Bytez and bytez_key:
            try:
                self.sdk = Bytez(bytez_key)
                self.llm = self.sdk.model("openai/gpt-4o")
                print("✓ Bytez AI initialized")
            except Exception as e:
                print(f"✗ Bytez initialization failed: {e}")

                
        # Google Gemini disabled
        self.gemini_model = None
        
        # Initialize Supabase
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
        else:
            self.supabase = None
        
        # Agent memory and feedback
        self.conversation_history = []
        self.feedback_data = []
        self.max_history = 10
        
        # Enhanced tools
        self.tools = {
            "scrape_syllabus": self.scrape_syllabus,
            "generate_pdf": self.generate_pdf_notes,
            "search_materials": self.search_study_materials,
            "answer_question": self.answer_study_question,
            "create_quiz": self.create_practice_quiz,
            "analyze_weak_topics": self.analyze_weak_topics,
            "create_study_plan": self.create_study_plan,
            "summarize_video": self.summarize_video,  # NEW
            "generate_flashcards": self.generate_flashcards,  # NEW
            "voice_interaction": self.voice_interaction,  # NEW
        }
    
    def think(self, user_input):
        """Enhanced reasoning with better prompt engineering"""
        print("\n🧠 Agent is thinking...")
        
        # Check if LLM is available
        if not self.llm:
            print("⚠️ LLM not available - returning fallback response")
            return {
                "action": "answer_question",
                "parameters": {"question": user_input},
                "reasoning": "Direct answer mode - AI service not configured",
                "confidence": 0.5
            }
        
        # Improved prompt with few-shot examples
        prompt = f"""You are an intelligent GTU study assistant. Analyze the request and choose the best action.

Available tools:
1. scrape_syllabus - Fetch GTU syllabus (params: subject_code)
2. generate_pdf - Create study notes PDF (params: subject_code, unit_number)
3. search_materials - Search database (params: query)
4. answer_question - Answer questions (params: question)
5. create_quiz - Generate quiz (params: topic, difficulty)
6. analyze_weak_topics - Find weak areas (params: subject_code)
7. create_study_plan - Plan schedule (params: exam_date, subjects)
8. summarize_video - Summarize YouTube lecture (params: video_url)
9. generate_flashcards - Create flashcards (params: topic, count)
10. voice_interaction - Handle voice query (params: audio_text)

Examples:
User: "Make flashcards for Operating Systems Unit 2"
Action: generate_flashcards, parameters: {{"topic": "Operating Systems Unit 2", "count": 10}}

User: "Summarize this lecture: https://youtube.com/watch?v=abc123"
Action: summarize_video, parameters: {{"video_url": "https://youtube.com/watch?v=abc123"}}

User request: "{user_input}"
Context: {self._get_recent_context()}

Respond with ONLY valid JSON:
{{
  "action": "action_name",
  "parameters": {{"param": "value"}},
  "reasoning": "why this action",
  "confidence": 0.95
}}"""

        messages = [{"role": "user", "content": prompt}]
        response = self._run_messages(messages)
        
        if response.error:
            print(f"❌ Error: {response.error}")
            return None
        
        try:
            decision = self._extract_json(response.output)
            confidence = decision.get('confidence', 0.5)
            
            print(f"✓ Action: {decision['action']} (confidence: {confidence:.0%})")
            print(f"  Reasoning: {decision['reasoning']}")
            
            # Log low confidence decisions for improvement
            if confidence < 0.7:
                print(f"⚠️ Low confidence decision - logging for review")
                self._log_uncertain_decision(user_input, decision)
            
            return decision
        except Exception as e:
            print(f"❌ Parse error: {e}")
            return None
    
    def act(self, decision):
        """Execute action with error handling"""
        if not decision:
            return "I couldn't understand your request. Please rephrase."
        
        action = decision.get('action')
        params = decision.get('parameters', {})
        
        print(f"\n🎬 Executing: {action}")
        
        try:
            if action in self.tools:
                result = self.tools[action](**params)
                return result
            else:
                return f"Unknown action: {action}"
        except Exception as e:
            print(f"❌ Execution error: {e}")
            return f"Error executing {action}: {str(e)}"
    
    # ==================== NEW TOOL: VIDEO SUMMARIZATION ====================
    
    def summarize_video(self, video_url):
        """Summarize YouTube educational videos"""
        print(f"  📹 Summarizing video: {video_url}")
        
        try:
            # Extract video ID
            video_id = self._extract_youtube_id(video_url)
            
            # Get transcript
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            full_transcript = " ".join([item['text'] for item in transcript_list])
            
            print(f"  ✓ Transcript retrieved ({len(full_transcript)} chars)")
            
            # Summarize with LLM
            prompt = f"""Summarize this GTU lecture video transcript for students.

Transcript: {full_transcript[:3000]}...

Provide:
1. Main topics covered (bullet points)
2. Key concepts explained
3. Important formulas/algorithms mentioned
4. Study tips based on content

Keep it concise (200-300 words)."""

            messages = [{"role": "user", "content": prompt}]
            response = self._run_messages(messages)
            
            if response.error:
                return f"Error summarizing: {response.error}"
            
            summary = response.output
            
            # Store in database
            if self.supabase:
                self.supabase.table("video_summaries").insert({
                    "video_url": video_url,
                    "video_id": video_id,
                    "summary": summary,
                    "created_at": datetime.now().isoformat()
                }).execute()
            
            return f"📹 Video Summary:\n\n{summary}"
            
        except Exception as e:
            return f"Error processing video: {str(e)}"
    
    # ==================== NEW TOOL: FLASHCARD GENERATION ====================
    
    def generate_flashcards(self, topic, count=10):
        """Generate AI-powered flashcards"""
        print(f"  🗂️ Generating {count} flashcards for {topic}...")
        
        prompt = f"""Generate {count} high-quality flashcards for GTU exam preparation on: {topic}

Format each flashcard as:
CARD N:
Q: [Question]
A: [Answer]

Requirements:
- Mix of definitions, concepts, and application questions
- Clear, concise questions
- Detailed but focused answers
- Include important formulas/algorithms where relevant
- Suitable for exam preparation

Generate all {count} cards now."""

        messages = [{"role": "user", "content": prompt}]
        response = self._run_messages(messages)
        
        if response.error:
            return f"Error: {response.error}"
        
        flashcards_text = response.output
        
        # Parse flashcards
        flashcards = self._parse_flashcards(flashcards_text)
        
        # Store in database
        if self.supabase and flashcards:
            for card in flashcards:
                self.supabase.table("flashcards").insert({
                    "topic": topic,
                    "question": card['question'],
                    "answer": card['answer'],
                    "created_at": datetime.now().isoformat()
                }).execute()
        
        print(f"  ✓ Generated {len(flashcards)} flashcards")
        
        # Create downloadable file
        self._save_flashcards_pdf(topic, flashcards)
        
        return f"🗂️ Generated {len(flashcards)} flashcards for {topic}\n\n{flashcards_text}"
    
    def _run_messages(self, messages):
        """Run with fallback: Lightning -> Bytez -> Gemini"""
        # 0. Try Lightning AI
        if self.lightning_client:
            try:
                # We use a default model, but flexible to change
                response = self.lightning_client.chat.completions.create(
                    model="gpt-4o", # Lightning AI supports standard aliases
                    messages=messages
                )
                
                content = response.choices[0].message.content
                
                class AIResponse:
                    def __init__(self, output): self.output = output; self.error = None
                return AIResponse(content)
                
            except Exception as e:
                print(f"⚠️ Lightning AI exception: {e}")
                # If it's a payment issue (402), we should probably let the user know specifically
                # rather than silently falling back if they expect Lightning to work.
                # However, for robustness, we fall through if Bytez is available.
                if "402" in str(e) or "insufficient_balance" in str(e):
                    class ErrorResponse:
                        def __init__(self, err): self.error = f"Lightning AI: Insufficient Credits. Please top up your account. {str(err)}"; self.output = None
                    return ErrorResponse(e)

        # 1. Try Bytez
        if self.llm:
            try:
                response = self.llm.run(messages)
                
                # If Bytez has an error, return it directly instead of falling back
                if hasattr(response, 'error') and response.error:
                     print(f"⚠️ Bytez returned error: {response.error}")
                     return response
                
                return response
            except Exception as e:
                print(f"⚠️ Bytez exception: {e}")
                class ErrorResponse:
                    def __init__(self, err): self.error = f"Bytez Error: {str(err)}"; self.output = None
                return ErrorResponse(e)

        # 2. Gemini Disabled
        if self.gemini_model:
            pass

        class NoAIResponse:
            def __init__(self): 
                self.error = "AI Service Error: Bytez is not configured or failed. Please check BYTEZ_API_KEY in your environment variables."
                self.output = None
        return NoAIResponse()

    def _run_ai(self, prompt):
        """Run AI query using available provider (Bytez or Gemini)"""
        messages = [{"role": "user", "content": prompt}]
        response = self._run_messages(messages)
        
        if response.error:
             return {"error": str(response.error)}
        return {"output": response.output}

    # ==================== PREDICT SEMESTER PAPER ====================
    
    def predict_semester_paper(self, subject_id):
        """Predict a GTU semester paper by analyzing patterns"""
        print(f"  🔮 Predicting semester paper for subject ID: {subject_id}...")
        
        try:
            # Get subject info
            if not self.supabase:
                return {"error": "Database not available"}
            
            subject_resp = self.supabase.table("subjects").select("*").eq("id", subject_id).execute()
            subject = subject_resp.data[0] if subject_resp.data else None
            subject_name = subject.get("subject_name", "Unknown") if subject else "Unknown"
            subject_code = subject.get("subject_code", "") if subject else ""
            
            # Check if AI is available
            if not self.llm and not self.gemini_model:
                print("⚠️ AI service not available - using database fallback")
                return self._generate_fallback_paper(subject_name, subject_code)
            
            # --- CACHE CHECK (NEW) ---
            try:
                # Check for existing predicted paper in study_materials
                cache_resp = self.supabase.table("study_materials") \
                    .select("*") \
                    .eq("subject_id", subject_id) \
                    .eq("material_type", "predicted_paper") \
                    .limit(1) \
                    .execute()
                
                if cache_resp.data:
                    print("  ✓ Found cached predicted paper")
                    cached_paper = cache_resp.data[0]
                    # Parse the JSON content
                    import json
                    try:
                        paper_data = json.loads(cached_paper['content'])
                        return paper_data
                    except json.JSONDecodeError:
                        print("  ⚠️ Cached paper has invalid JSON content, regenerating...")
            except Exception as e:
                print(f"  ⚠️ Cache check failed: {e}")
            # -------------------------

            # Get previous papers info
            papers_resp = self.supabase.table("previous_papers").select("*").eq("subject_id", subject_id).execute()
            papers = papers_resp.data or []
            
            papers_info = ""
            for p in papers:
                papers_info += f"- {p.get('year')} {p.get('exam_type')}\n"
            
            prompt = f"""You are a GTU exam paper predictor. Analyze patterns and generate a predicted exam paper.

Subject: {subject_name}
Available Previous Papers:
{papers_info if papers_info else "No specific papers available, use general GTU patterns."}

Generate a PREDICTED GTU EXAM PAPER (70 Marks total) with these requirements:
1. Follow standard GTU format: Q1-Q5, each with (a), (b), (c) parts
2. For EACH question part, identify the likely Unit and Chapter
3. Mark high-probability questions based on GTU patterns
4. Output in JSON format

JSON Structure:
{{
  "subject_name": "{subject_name}",
  "questions": [
    {{
      "q_number": "1(a)",
      "question": "Question text here",
      "marks": 3,
      "unit": "Unit 1",
      "chapter": "Introduction",
      "probability": "High"
    }},
    {{
      "q_number": "1(b)",
      "question": "Another question",
      "marks": 4,
      "unit": "Unit 1", 
      "chapter": "Basics",
      "probability": "Medium"
    }}
  ]
}}

Generate 15-20 question parts covering all units. Mark 5-7 as "High" probability."""

            result = self._run_ai(prompt)
            
            if "error" in result:
                print(f"AI Error: {result['error']} - using fallback")
                return self._generate_fallback_paper(subject_name, subject_code)
            
            paper_json = self._extract_json(result["output"])
            
            # --- CACHE SAVE (NEW) ---
            try:
                # Store the generated paper in study_materials
                self.supabase.table("study_materials").insert({
                    "subject_id": subject_id,
                    "title": f"Predicted GTU Paper 2025 - {subject_name}",
                    "content": json.dumps(paper_json), # Store as string
                    "material_type": "predicted_paper",
                    "created_at": datetime.now().isoformat()
                }).execute()
                print("  ✓ Saved predicted paper to cache (study_materials)")
            except Exception as e:
                 print(f"  ⚠️ Failed to save to cache: {e}")
            # ------------------------
            
            return paper_json
            
        except Exception as e:
            print(f"Error predicting paper: {e}")
            # Try fallback as last resort
            try:
                return self._generate_fallback_paper(subject_name, subject_code)
            except:
                return {"error": str(e)}

    def _generate_fallback_paper(self, subject_name, subject_code):
        """Generate a paper using important questions from database"""
        print(f"  Generating fallback paper for {subject_name}")
        
        questions = []
        
        # Fetch important questions
        try:
            resp = self.supabase.table("important_questions").select("*").eq("subject_code", subject_code).execute()
            db_questions = resp.data if resp.data else []
        except:
            db_questions = []
            
        # If no DB questions, use generic ones
        if not db_questions:
            return {
                "subject_name": subject_name,
                "questions": [
                    {"q_number": "1(a)", "question": f"Explain the basic concepts of {subject_name}.", "marks": 3, "unit": "Unit 1", "probability": "High"},
                    {"q_number": "1(b)", "question": "Discuss the importance of this subject in engineering.", "marks": 4, "unit": "Unit 1", "probability": "Medium"},
                    {"q_number": "1(c)", "question": "Explain key terminology and definitions.", "marks": 7, "unit": "Unit 1", "probability": "High"},
                    {"q_number": "2(a)", "question": "Compare and contrast different approaches.", "marks": 3, "unit": "Unit 2", "probability": "Medium"},
                    {"q_number": "2(b)", "question": "Explain with a suitable diagram.", "marks": 4, "unit": "Unit 2", "probability": "High"},
                    {"q_number": "2(c)", "question": "Solve the following problem (Example Problem).", "marks": 7, "unit": "Unit 2", "probability": "High"},
                    {"q_number": "3(a)", "question": "Write short notes on advanced topics.", "marks": 3, "unit": "Unit 3", "probability": "Medium"},
                    {"q_number": "3(b)", "question": "Explain the working principle.", "marks": 4, "unit": "Unit 3", "probability": "High"},
                    {"q_number": "3(c)", "question": "Derive the equation/algorithm.", "marks": 7, "unit": "Unit 3", "probability": "High"},
                    {"q_number": "4(a)", "question": "List advantages and disadvantages.", "marks": 3, "unit": "Unit 4", "probability": "Medium"},
                    {"q_number": "4(b)", "question": "Explain the architecture/structure.", "marks": 4, "unit": "Unit 4", "probability": "High"},
                    {"q_number": "4(c)", "question": "Explain with a real-world example.", "marks": 7, "unit": "Unit 4", "probability": "High"},
                    {"q_number": "5(a)", "question": "Define the following terms.", "marks": 3, "unit": "Unit 5", "probability": "Medium"},
                    {"q_number": "5(b)", "question": "Differentiate between X and Y.", "marks": 4, "unit": "Unit 5", "probability": "High"},
                    {"q_number": "5(c)", "question": "Write a detailed note on recent trends.", "marks": 7, "unit": "Unit 5", "probability": "High"}
                ],
                "note": "⚠️ Generated in Offline Mode (AI Unavailable)"
            }

        # Map DB questions to paper structure
        # We need roughly 15 questions. 
        import random
        selected = db_questions[:15] if len(db_questions) > 15 else db_questions
        random.shuffle(selected)
        
        q_structure = ["1(a)", "1(b)", "1(c)", "2(a)", "2(b)", "2(c)", "3(a)", "3(b)", "3(c)", "4(a)", "4(b)", "4(c)", "5(a)", "5(b)", "5(c)"]
        marks_map = {"(a)": 3, "(b)": 4, "(c)": 7}
        
        for i, q_num in enumerate(q_structure):
            if i < len(selected):
                q_data = selected[i]
                questions.append({
                    "q_number": q_num,
                    "question": q_data.get("question_text", "Question text"),
                    "marks": marks_map.get(q_num[-3:], 7),
                    "unit": f"Unit {q_data.get('unit', 1)}",
                    "chapter": "Important Topics",
                    "probability": "High"
                })
            else:
                # Fill remaining with generic if we run out of DB questions
                suffix = q_num[-3:]
                questions.append({
                    "q_number": q_num,
                    "question": f"Explain important concept from Unit {i//3 + 1}",
                    "marks": marks_map.get(suffix, 7),
                    "unit": f"Unit {i//3 + 1}",
                    "chapter": "General",
                    "probability": "Medium"
                })
                
        return {
            "subject_name": subject_name,
            "questions": questions,
            "note": "⚠️ Generated from Important Questions Database (AI Unavailable)"
        }
    
    def generate_gtu_answer(self, question, subject_id=None):
        """Generate a perfect GTU-style answer for a question"""
        print(f"  ✍️ Generating answer for: {question[:50]}...")
        
        try:
            # Check if AI is available
            if not self.llm and not self.gemini_model:
                print("⚠️ AI service not available - using fallback answer")
                return self._generate_fallback_answer(question)
            
            prompt = f"""Generate a perfect GTU exam answer for this question:
"{question}"

Requirements:
1. Point-wise answer (GTU gives marks per point)
2. Include diagram description if applicable
3. Identify the Unit and Chapter
4. Keep it exam-appropriate length (suitable for the marks)

Output as JSON:
{{
  "answer": "Your detailed point-wise answer here...",
  "unit": "Unit X",
  "chapter": "Chapter Name",
  "diagram_suggestion": "Description of diagram to draw (or null if not needed)"
}}"""

            result = self._run_ai(prompt)
            
            if "error" in result:
                print(f"AI Error: {result['error']} - using fallback")
                return self._generate_fallback_answer(question)
            
            return self._extract_json(result["output"])
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            return self._generate_fallback_answer(question)

    def _generate_fallback_answer(self, question):
        """Generate a generic fallback answer"""
        return {
            "answer": f"""**Answer for: {question}**

*(Note: AI service is currently unavailable. Here is a general structure for answering this question)*

1. **Introduction**: Start by defining the key terms in the question.
2. **Main Concept**: Explain the core concept in 3-4 bullet points.
   - Point 1: Key feature or characteristic
   - Point 2: Working principle or mechanism
   - Point 3: Important advantage or application
3. **Diagram**: Always draw a neat, labeled diagram if applicable.
4. **Example**: Provide a small example to illustrate the concept.
5. **Conclusion**: Summarize the answer in one sentence.

*To get the specific detailed answer, please ensure the AI service is configured.*""",
            "unit": "General",
            "chapter": "Important Topics",
            "diagram_suggestion": "Draw a block diagram or flowchart representing the concept."
        }
    
    def voice_interaction(self, audio_text):
        """Handle voice-transcribed queries"""
        print(f"  🎤 Processing voice input: {audio_text}")
        
        # Voice queries are often more conversational
        prompt = f"""The student asked via voice: "{audio_text}"

Provide a clear, spoken-style answer that's easy to understand when read aloud.
Keep it concise (2-3 sentences) and natural."""

        messages = [{"role": "user", "content": prompt}]
        response = self._run_messages(messages)
        
        if response.error:
            return "Sorry, I couldn't process that."
        
        return response.output
    
    # ==================== FEEDBACK LOOP ====================
    
    def add_feedback(self, user_input, agent_response, rating, comment=""):
        """Collect user feedback to improve agent"""
        feedback = {
            "user_input": user_input,
            "agent_response": agent_response,
            "rating": rating,  # 1-5 stars
            "comment": comment,
            "timestamp": datetime.now().isoformat()
        }
        
        self.feedback_data.append(feedback)
        
        # Store in database
        if self.supabase:
            self.supabase.table("agent_feedback").insert(feedback).execute()
        
        print(f"✓ Feedback logged: {rating}/5 stars")
    
    def analyze_feedback(self):
        """Analyze feedback to identify improvement areas"""
        if not self.feedback_data:
            return "No feedback data yet"
        
        avg_rating = sum([f['rating'] for f in self.feedback_data]) / len(self.feedback_data)
        low_rated = [f for f in self.feedback_data if f['rating'] <= 2]
        
        analysis = f"""Feedback Analysis:
- Total feedback: {len(self.feedback_data)}
- Average rating: {avg_rating:.2f}/5
- Low-rated responses: {len(low_rated)}

Improvement areas:
"""
        
        if low_rated:
            for feedback in low_rated[:3]:
                analysis += f"\n- Query: {feedback['user_input'][:50]}..."
                analysis += f"\n  Issue: {feedback['comment']}\n"
        
        return analysis
    
    # ==================== HELPER METHODS ====================
    
    def _extract_youtube_id(self, url):
        """Extract YouTube video ID from URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]*)',
            r'youtube\.com\/embed\/([^&\n?]*)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        raise ValueError("Invalid YouTube URL")
    
    def _parse_flashcards(self, text):
        """Parse flashcards from text"""
        cards = []
        card_pattern = r'CARD \d+:\s*Q:\s*(.+?)\s*A:\s*(.+?)(?=CARD \d+:|$)'
        matches = re.findall(card_pattern, text, re.DOTALL)
        
        for q, a in matches:
            cards.append({
                "question": q.strip(),
                "answer": a.strip()
            })
        
        return cards
    
    def _save_flashcards_pdf(self, topic, flashcards):
        """Save flashcards as PDF"""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, f"Flashcards: {topic}", 0, 1, "C")
        pdf.ln(10)
        
        for i, card in enumerate(flashcards, 1):
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 8, f"Card {i}", 0, 1)
            pdf.set_font("Arial", "", 11)
            pdf.multi_cell(0, 6, f"Q: {card['question']}")
            pdf.multi_cell(0, 6, f"A: {card['answer']}")
            pdf.ln(5)
        
        filename = f"flashcards_{topic.replace(' ', '_')}.pdf"
        pdf.output(filename)
        print(f"  ✓ Flashcards saved: {filename}")
    
    def _get_recent_context(self):
        """Get conversation context"""
        recent = self.conversation_history[-4:]
        return "\n".join([f"{msg['role']}: {msg['content'][:80]}..." for msg in recent])
    
    def _extract_json(self, text):
        """Extract JSON from response"""
        # Handle dict response from Bytez
        if isinstance(text, dict):
            if 'content' in text:
                text = text['content']
            else:
                # If it's already the JSON dict we want
                return text
            
        start = text.find('{')
        end = text.rfind('}') + 1
        
        if start != -1 and end != 0:
            return json.loads(text[start:end])
        raise ValueError("No JSON found")
        
        if start != -1 and end != 0:
            return json.loads(text[start:end])
        raise ValueError("No JSON found")
    
    def _log_uncertain_decision(self, user_input, decision):
        """Log low-confidence decisions for improvement"""
        if self.supabase:
            self.supabase.table("uncertain_decisions").insert({
                "user_input": user_input,
                "decision": json.dumps(decision),
                "timestamp": datetime.now().isoformat()
            }).execute()
    
    # Existing methods from previous version...
    def scrape_syllabus(self, subject_code):
        return f"Scraping syllabus for {subject_code}..."
    
    def generate_pdf_notes(self, subject_code, unit_number):
        print(f"  📄 Generating PDF notes for {subject_code} Unit {unit_number}...")
        try:
            # Import here to avoid circular imports if any
            from backend.pdf_generator import generate_unit_pdf
            
            # Convert unit_number to int if it's a string
            try:
                unit_number = int(unit_number)
            except:
                pass
                
            result = generate_unit_pdf(subject_code, unit_number)
            
            if result.get("success"):
                return f"✅ PDF Generated Successfully!\nTitle: {result['title']}\nLink: {result['pdf_url']}"
            else:
                return f"❌ Failed to generate PDF: {result.get('error')}"
        except Exception as e:
            print(f"Error in generate_pdf_notes: {e}")
            return f"❌ Error: {str(e)}"
    
    def search_study_materials(self, query):
        return f"Searching for: {query}..."
    
    def answer_study_question(self, question):
        """Answer study questions - fallback when main AI is unavailable"""
        if self.llm:
            # Use AI to answer
            try:
                messages = [{"role": "user", "content": f"Answer this GTU exam question concisely: {question}"}]
                response = self._run_messages(messages)
                if not response.error:
                    return response.output
            except:
                pass
        
        # Fallback response
        return f"""📚 **Your Question:** {question}

I'm currently in offline mode (AI service not configured). Here's what I suggest:

1. **Check Study Materials** - Browse the Syllabus section for relevant notes
2. **Previous Year Papers** - Similar questions may have appeared before  
3. **Video Tutorials** - Watch explanations in the Video section

💡 **Tip:** Search for key terms from your question in the Study Materials.

To enable AI answers, please configure the BYTEZ_API_KEY in your environment."""
    
    def create_practice_quiz(self, topic, difficulty="medium"):
        return f"Creating {difficulty} quiz for {topic}..."
    
    def analyze_weak_topics(self, subject_code):
        return f"Analyzing weak topics for {subject_code}..."
    
    def create_study_plan(self, exam_date, subjects):
        return f"Creating study plan for {subjects} until {exam_date}..."

# ==================== FASTAPI WITH SCHEDULING ====================

# Background scheduler for cron jobs
scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 Starting scheduler...")
    scheduler.start()
    
    # Schedule daily syllabus scraping at midnight
    scheduler.add_job(
        daily_scrape_task,
        'cron',
        hour=0,
        minute=0,
        id='daily_scrape'
    )
    
    # Schedule weekly summary generation every Sunday
    scheduler.add_job(
        weekly_summary_task,
        'cron',
        day_of_week='sun',
        hour=20,
        minute=0,
        id='weekly_summary'
    )
    
    print("✓ Scheduled jobs registered")
    
    yield
    
    # Shutdown
    print("🛑 Stopping scheduler...")
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "https://gtu-exam-prep.vercel.app",  # Production
        "https://*.vercel.app"  # Preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize agent
agent = EnhancedGTUAgent(
    bytez_key=os.getenv("BYTEZ_API_KEY"),
    google_key=os.getenv("GOOGLE_API_KEY"),
    lightning_key=os.getenv("LIGHTNING_API_KEY"),
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)

# ==================== API ENDPOINTS ====================

@app.get("/agent/health")
async def health_check():
    """Health check endpoint with AI status"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "ai_status": {
            "lightning_initialized": bool(agent.lightning_client),
            "bytez_initialized": bool(agent.llm),
            "google_initialized": bool(agent.gemini_model),
            "bytez_lib_available": BYTEZ_AVAILABLE,
            "google_lib_available": GOOGLE_AVAILABLE,
            "lightning_key_configured": bool(os.getenv("LIGHTNING_API_KEY")),
            "bytez_key_configured": bool(os.getenv("BYTEZ_API_KEY")),
            "google_key_configured": bool(os.getenv("GOOGLE_API_KEY"))
        }
    }

@app.post("/agent/chat")
async def chat_with_agent(user_input: str):
    """Main chat endpoint"""
    try:
        # Think
        decision = agent.think(user_input)
        
        # Act
        result = agent.act(decision)
        
        return {
            "success": True,
            "response": result,
            "action_taken": decision.get('action') if decision else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/summarize-video")
async def summarize_video_endpoint(video_url: str):
    """Summarize YouTube video"""
    result = agent.summarize_video(video_url)
    return {"summary": result}

@app.post("/agent/flashcards")
async def generate_flashcards_endpoint(topic: str, count: int = 10):
    """Generate flashcards"""
    result = agent.generate_flashcards(topic, count)
    return {"flashcards": result}

@app.post("/agent/feedback")
async def submit_feedback(
    user_input: str,
    agent_response: str,
    rating: int,
    comment: str = ""
):
    """Submit user feedback"""
    agent.add_feedback(user_input, agent_response, rating, comment)
    return {"message": "Feedback recorded"}

@app.get("/agent/analytics")
async def get_analytics():
    """Get agent performance analytics"""
    analysis = agent.analyze_feedback()
    return {"analytics": analysis}

# ==================== SCHEDULED TASKS ====================

def daily_scrape_task():
    """Runs daily at midnight"""
    print("\n🔄 Running daily scrape task...")
    subjects = ["3140705", "3140708", "3140709"]  # Example subject codes
    
    for subject in subjects:
        agent.scrape_syllabus(subject)
        time.sleep(5)
    
    print("✓ Daily scrape completed")

def weekly_summary_task():
    """Runs every Sunday at 8 PM"""
    print("\n📊 Generating weekly summary...")
    
    # Generate summary of user activity, popular topics, etc.
    summary = {
        "week": datetime.now().strftime("%Y-W%U"),
        "total_queries": len(agent.conversation_history),
        "avg_rating": sum([f['rating'] for f in agent.feedback_data]) / len(agent.feedback_data) if agent.feedback_data else 0
    }
    
    print(f"✓ Weekly summary: {summary}")
