from flask import jsonify, request
from flask_jwt_extended import jwt_required
from backend.api import api_bp
from backend.supabase_client import supabase
from backend.ai import ai_processor

@api_bp.route('/health')
def health_check():
    return jsonify({'status': 'healthy'})

@api_bp.route('/subjects')
def get_subjects():
    # Get subjects from Supabase with optional filters
    try:
        course = request.args.get('course')
        branch = request.args.get('branch')
        semester = request.args.get('semester')
        
        query = supabase.table("subjects").select("*")
        
        if course:
            query = query.eq("course", course)
        if branch:
            query = query.eq("branch", branch)
        if semester:
            query = query.eq("semester", semester)
            
        response = query.execute()
        
        subjects = []
        if response.data:
            for s in response.data:
                if isinstance(s, dict):
                    subjects.append({
                        'id': s.get("id", 0),
                        'course': s.get("course", ""),
                        'branch': s.get("branch", ""),
                        'semester': s.get("semester", ""),
                        'subject_code': s.get("subject_code", ""),
                        'subject_name': s.get("subject_name", ""),
                        'credits': s.get("credits", 0)
                    })
        return jsonify({'subjects': subjects})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch subjects: {str(e)}'}), 500

@api_bp.route('/subjects/metadata')
def get_subject_metadata():
    # Get unique courses, branches, and semesters for filtering
    try:
        # Fetch all subjects to extract unique values
        # In a production app with many rows, we would use a distinct query or separate tables
        response = supabase.table("subjects").select("course,branch,semester").execute()
        
        courses = set()
        branches = set()
        semesters = set()
        
        if response.data:
            for s in response.data:
                if s.get("course"): courses.add(s.get("course"))
                if s.get("branch"): branches.add(s.get("branch"))
                if s.get("semester"): semesters.add(s.get("semester"))
                
        return jsonify({
            'courses': sorted(list(courses)),
            'branches': sorted(list(branches)),
            'semesters': sorted(list(semesters), key=lambda x: int(x) if x.isdigit() else x)
        })
    except Exception as e:
        return jsonify({'error': f'Failed to fetch metadata: {str(e)}'}), 500

@api_bp.route('/subjects/<int:subject_id>')
def get_subject_by_id(subject_id):
    """Get a specific subject by ID"""
    try:
        response = supabase.table("subjects").select("*").eq("id", subject_id).execute()
        
        if response.data and len(response.data) > 0:
            s = response.data[0]
            subject = {
                'id': s.get("id", 0),
                'course': s.get("course", ""),
                'branch': s.get("branch", ""),
                'semester': s.get("semester", ""),
                'subject_code': s.get("subject_code", ""),
                'subject_name': s.get("subject_name", ""),
                'credits': s.get("credits", 0)
            }
            return jsonify({'subject': subject})
        else:
            return jsonify({'error': 'Subject not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Failed to fetch subject: {str(e)}'}), 500

@api_bp.route('/syllabus/<int:subject_id>')
def get_syllabus(subject_id):
    # Get syllabus for a subject from Supabase
    try:
        response = supabase.table("syllabus").select("*").eq("subject_id", subject_id).order("unit_number").execute()
        syllabi = []
        if response.data:
            for s in response.data:
                if isinstance(s, dict):
                    syllabi.append({
                        'unit_number': s.get("unit_number", 0),
                        'unit_title': s.get("unit_title", ""),
                        'content': s.get("content", "")
                    })
        return jsonify({'syllabus': syllabi})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch syllabus: {str(e)}'}), 500

@api_bp.route('/questions/<int:subject_id>')
def get_questions(subject_id):
    # Get questions for a subject from Supabase
    try:
        response = supabase.table("questions").select("*").eq("subject_id", subject_id).execute()
        questions = []
        if response.data:
            for q in response.data:
                if isinstance(q, dict):
                    questions.append({
                        'id': q.get("id", 0),
                        'unit_number': q.get("unit_number", 0),
                        'question_text': q.get("question_text", ""),
                        'marks': q.get("marks", 0),
                        'question_type': q.get("question_type", ""),
                        'options': q.get("options", []),
                        'ai_explanation': q.get("ai_explanation", ""),
                        'is_important': q.get("is_important", False),
                        'frequency_count': q.get("frequency_count", 0),
                        'difficulty_level': q.get("difficulty_level", "Medium"),
                        'gtu_section': q.get("gtu_section", "")
                    })
        return jsonify({'questions': questions})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch questions: {str(e)}'}), 500

@api_bp.route('/questions/important/<int:subject_id>')
def get_important_questions(subject_id):
    # Get important questions for a subject
    try:
        response = supabase.table("questions").select("*").eq("subject_id", subject_id).eq("is_important", True).order("frequency_count", desc=True).execute()
        questions = []
        if response.data:
            for q in response.data:
                if isinstance(q, dict):
                    questions.append({
                        'id': q.get("id", 0),
                        'unit_number': q.get("unit_number", 0),
                        'question_text': q.get("question_text", ""),
                        'marks': q.get("marks", 0),
                        'question_type': q.get("question_type", ""),
                        'frequency_count': q.get("frequency_count", 0),
                        'difficulty_level': q.get("difficulty_level", "Medium")
                    })
        return jsonify({'questions': questions})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch important questions: {str(e)}'}), 500

@api_bp.route('/previous-papers/<int:subject_id>')
def get_previous_papers(subject_id):
    # Get previous papers for a subject from Supabase
    try:
        response = supabase.table("previous_papers").select("*").eq("subject_id", subject_id).execute()
        papers = []
        if response.data:
            for p in response.data:
                if isinstance(p, dict):
                    papers.append({
                        'id': p.get("id", 0),
                        'year': p.get("year", ""),
                        'exam_type': p.get("exam_type", ""),
                        'paper_pdf_url': p.get("paper_pdf_url", ""),
                        'solution_pdf_url': p.get("solution_pdf_url", "")
                    })
        return jsonify({'papers': papers})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch papers: {str(e)}'}), 500

@api_bp.route('/mock-tests/<int:subject_id>')
def get_mock_tests(subject_id):
    # Get mock tests for a subject from Supabase
    try:
        response = supabase.table("mock_tests").select("*").eq("subject_id", subject_id).execute()
        tests = []
        if response.data:
            for t in response.data:
                if isinstance(t, dict):
                    tests.append({
                        'id': t.get("id", 0),
                        'subject_id': t.get("subject_id", 0),
                        'title': t.get("title", ""),
                        'duration_minutes': t.get("duration_minutes", 0),
                        'started_at': t.get("started_at", ""),
                        'completed_at': t.get("completed_at", ""),
                        'score': t.get("score", 0),
                        'max_score': t.get("max_score", 0)
                    })
        return jsonify({'tests': tests})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch mock tests: {str(e)}'}), 500

@api_bp.route('/mock-tests/generate', methods=['POST'])
def generate_mock_test():
    """
    Generate a new mock test following GTU pattern:
    Q1: 14 Short Questions (1 mark each) = 14 marks
    Q2-Q5: Long Questions (3, 4, 7 marks) = 14 marks each * 4 = 56 marks
    Internal Option: The 7-mark question in Q2-Q5 will have an internal option (OR).
    Total: 70 marks
    """
    try:
        data = request.get_json()
        subject_id = data.get('subject_id')
        title = data.get('title', 'GTU Mock Test')
        
        if not subject_id:
            return jsonify({'error': 'Subject ID is required'}), 400
            
        # 1. Fetch all questions for the subject
        response = supabase.table("questions").select("*").eq("subject_id", subject_id).execute()
        all_questions = response.data
        
        if not all_questions:
            return jsonify({'error': 'No questions found for this subject'}), 404
            
        # 2. Categorize questions by marks
        q_1mark = [q for q in all_questions if q.get('marks') == 1]
        q_3mark = [q for q in all_questions if q.get('marks') == 3]
        q_4mark = [q for q in all_questions if q.get('marks') == 4]
        q_7mark = [q for q in all_questions if q.get('marks') == 7]
        
        # 3. Select questions (Randomly)
        import random
        
        # Need 14 questions of 1 mark
        selected_1mark = random.sample(q_1mark, min(len(q_1mark), 14))
        
        # Need 4 questions of 3 marks
        selected_3mark = random.sample(q_3mark, min(len(q_3mark), 4))
        
        # Need 4 questions of 4 marks
        selected_4mark = random.sample(q_4mark, min(len(q_4mark), 4))
        
        # Need 4 questions of 7 marks PLUS 4 alternatives = 8 questions
        # If we don't have enough, we just won't provide an option
        count_7mark_needed = 8
        selected_7mark = random.sample(q_7mark, min(len(q_7mark), count_7mark_needed))
        
        # 4. Construct Paper Structure
        # Helper to safely get a question ID
        def get_q_id(source_list, index):
            return source_list[index]['id'] if index < len(source_list) else None

        sections = []
        
        # Q1: 14 marks
        sections.append({
            "section_name": "Q1",
            "total_marks": 14,
            "questions": [q['id'] for q in selected_1mark]
        })
        
        # Q2-Q5
        for i in range(4):
            section_num = i + 2 # Q2, Q3, Q4, Q5
            
            # Get main questions
            q3 = get_q_id(selected_3mark, i)
            q4 = get_q_id(selected_4mark, i)
            
            # Get 7 mark question and its alternative
            # We use indices i and i+4 for the 7 mark questions
            q7_main = get_q_id(selected_7mark, i)
            q7_alt = get_q_id(selected_7mark, i + 4)
            
            sub_questions = [
                {"marks": 3, "question_id": q3},
                {"marks": 4, "question_id": q4},
                {"marks": 7, "question_id": q7_main, "alternative_id": q7_alt}
            ]
            
            sections.append({
                "section_name": f"Q{section_num}",
                "total_marks": 14,
                "sub_questions": sub_questions
            })

        paper_structure = {
            "sections": sections
        }
        
        # 5. Create Mock Test Record
        test_data = {
            "subject_id": subject_id,
            "title": title,
            "duration_minutes": 150, # 2.5 hours
            "max_score": 70,
            "paper_structure": paper_structure,
            "started_at": "now()"
        }
        
        insert_response = supabase.table("mock_tests").insert(test_data).execute()
        
        if not insert_response.data:
             return jsonify({'error': 'Failed to create mock test record'}), 500
             
        new_test = insert_response.data[0]
        test_id = new_test['id']
        
        # 6. Insert into test_questions
        all_selected_ids = [q['id'] for q in selected_1mark]
        all_selected_ids.extend([q['id'] for q in selected_3mark])
        all_selected_ids.extend([q['id'] for q in selected_4mark])
        all_selected_ids.extend([q['id'] for q in selected_7mark]) # Includes alternatives
            
        test_questions_data = [{"test_id": test_id, "question_id": q_id} for q_id in all_selected_ids if q_id]
        
        if test_questions_data:
            supabase.table("test_questions").insert(test_questions_data).execute()
            
        return jsonify({
            'success': True,
            'test_id': test_id,
            'message': 'Mock test generated successfully',
            'structure': paper_structure
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate PDF: {str(e)}'}), 500

@api_bp.route('/mock-tests/detail/<int:test_id>')
def get_mock_test_detail(test_id):
    """Get full details of a mock test including structure and questions"""
    try:
        # 1. Get test info
        test_response = supabase.table("mock_tests").select("*").eq("id", test_id).execute()
        if not test_response.data:
            return jsonify({'error': 'Test not found'}), 404
            
        test = test_response.data[0]
        
        # 2. Get questions for this test
        # We need to join with questions table. 
        # Supabase-py join syntax can be tricky, let's do it in two steps for safety if simple join fails
        # Try: select(*, questions(*)) from test_questions
        
        tq_response = supabase.table("test_questions").select("*, questions(*)").eq("test_id", test_id).execute()
        
        questions = []
        if tq_response.data:
            for item in tq_response.data:
                q = item.get('questions')
                if q:
                    questions.append(q)
                    
        return jsonify({
            'test': test,
            'questions': questions
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch test details: {str(e)}'}), 500

@api_bp.route('/ai-assistant', methods=['POST'])
def ai_assistant():
    """
    AI assistant endpoint using GPT-4o
    """
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        # Generate AI response using GPT-4o
        context = "You are an AI tutor helping GTU students prepare for their exams. Provide clear, concise, and accurate explanations."
        ai_response = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'response': ai_response
        }), 200
    except Exception as e:
        return jsonify({'error': f'AI response generation failed: {str(e)}'}), 500

@api_bp.route('/chat', methods=['POST'])
def chat():
    """
    Streaming chat endpoint for Vercel AI SDK
    """
    from flask import Response
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Get the last user message
        last_message = messages[-1]['content']
        context = "You are an AI tutor helping GTU students prepare for their exams. Provide clear, concise, and accurate explanations."
        
        return Response(
            ai_processor.stream_response(last_message, context),
            mimetype='text/event-stream'
        )
    except Exception as e:
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500

@api_bp.route('/summarize-unit', methods=['POST'])
def summarize_unit():
    """
    Summarize a specific unit using AI
    """
    try:
        data = request.get_json()
        subject_code = data.get('subject_code')
        unit_number = data.get('unit_number')
        
        if not subject_code or not unit_number:
            return jsonify({'error': 'Subject code and unit number are required'}), 400
            
        # 1. Fetch unit content from database (notes or syllabus)
        # Try notes first as they might have more content
        notes_response = supabase.table("notes").select("description").eq("subject_code", subject_code).eq("unit", unit_number).execute()
        
        content_to_summarize = ""
        if notes_response.data:
            # Combine descriptions from all notes for this unit
            content_to_summarize = "\n".join([n.get('description', '') for n in notes_response.data])
            
        # If no notes, try syllabus content
        if not content_to_summarize:
            syllabus_response = supabase.table("syllabus_content").select("topics").eq("subject_code", subject_code).eq("unit", unit_number).execute()
            if syllabus_response.data:
                content_to_summarize = "\n".join([s.get('topics', '') for s in syllabus_response.data])
                
        if not content_to_summarize:
            # If still no content, try to fetch subject name to at least generate a generic summary based on unit title if available
            # For now, just return error or generic prompt
            return jsonify({'error': 'No content found for this unit to summarize'}), 404
            
        # 2. Generate Summary
        prompt = f"Please provide a concise summary of the following unit content for Subject {subject_code}, Unit {unit_number}:\n\n{content_to_summarize[:2000]}"
        context = "You are an expert academic summarizer. Create a clear, bulleted summary of the key concepts in this unit."
        
        summary = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'summary': summary
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

@api_bp.route('/updates')
def get_updates():
    """Get all GTU updates with optional filters"""
    try:
        # Get query parameters
        category = request.args.get('category')  # circular, news, exam_schedule
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        date_from = request.args.get('date_from')  # YYYY-MM-DD format
        date_to = request.args.get('date_to')  # YYYY-MM-DD format
        
        # Build query
        query = supabase.table("gtu_updates").select("*")
        
        # Apply filters
        if category:
            query = query.eq("category", category)
        
        if date_from:
            query = query.gte("date", date_from)
        
        if date_to:
            query = query.lte("date", date_to)
        
        # Order by date descending and apply pagination
        query = query.order("date", desc=True).order("id", desc=True).limit(limit).range(offset, offset + limit - 1)
        
        response = query.execute()
        
        updates = []
        if response.data:
            for u in response.data:
                if isinstance(u, dict):
                    updates.append({
                        'id': u.get("id", 0),
                        'category': u.get("category", ""),
                        'title': u.get("title", ""),
                        'description': u.get("description", ""),
                        'date': u.get("date", ""),
                        'link_url': u.get("link_url", ""),
                        'scraped_at': u.get("scraped_at", ""),
                    })
        
        return jsonify({
            'success': True,
            'count': len(updates),
            'updates': updates
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch updates: {str(e)}'}), 500

@api_bp.route('/updates/latest')
def get_latest_updates():
    """Get latest updates from the last 7 days"""
    try:
        from datetime import datetime, timedelta
        
        # Calculate date 7 days ago
        seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Query updates from last 7 days
        response = supabase.table("gtu_updates").select("*").gte("date", seven_days_ago).order("date", desc=True).order("id", desc=True).limit(100).execute()
        
        updates = []
        if response.data:
            for u in response.data:
                if isinstance(u, dict):
                    updates.append({
                        'id': u.get("id", 0),
                        'category': u.get("category", ""),
                        'title': u.get("title", ""),
                        'description': u.get("description", ""),
                        'date': u.get("date", ""),
                        'link_url': u.get("link_url", ""),
                        'scraped_at': u.get("scraped_at", ""),
                    })
        
        return jsonify({
            'success': True,
            'count': len(updates),
            'period': 'last_7_days',
            'updates': updates
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch latest updates: {str(e)}'}), 500

@api_bp.route('/updates/circulars')
def get_circulars():
    """Get only circulars"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        response = supabase.table("gtu_updates").select("*").eq("category", "circular").order("date", desc=True).limit(limit).execute()
        
        circulars = []
        if response.data:
            for c in response.data:
                if isinstance(c, dict):
                    circulars.append({
                        'id': c.get("id", 0),
                        'title': c.get("title", ""),
                        'description': c.get("description", ""),
                        'date': c.get("date", ""),
                        'link_url': c.get("link_url", ""),
                        'scraped_at': c.get("scraped_at", ""),
                    })
        
        return jsonify({
            'success': True,
            'count': len(circulars),
            'circulars': circulars
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch circulars: {str(e)}'}), 500

@api_bp.route('/updates/news')
def get_news():
    """Get only news items"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        response = supabase.table("gtu_updates").select("*").eq("category", "news").order("date", desc=True).limit(limit).execute()
        
        news = []
        if response.data:
            for n in response.data:
                if isinstance(n, dict):
                    news.append({
                        'id': n.get("id", 0),
                        'title': n.get("title", ""),
                        'description': n.get("description", ""),
                        'date': n.get("date", ""),
                        'link_url': n.get("link_url", ""),
                        'scraped_at': n.get("scraped_at", ""),
                    })
        
        return jsonify({
            'success': True,
            'count': len(news),
            'news': news
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch news: {str(e)}'}), 500

@api_bp.route('/updates/exam-schedules')
def get_exam_schedules():
    """Get only exam schedules"""
    try:
        limit = request.args.get('limit', 50, type=int)
        
        response = supabase.table("gtu_updates").select("*").eq("category", "exam_schedule").order("date", desc=True).limit(limit).execute()
        
        exam_schedules = []
        if response.data:
            for e in response.data:
                if isinstance(e, dict):
                    exam_schedules.append({
                        'id': e.get("id", 0),
                        'title': e.get("title", ""),
                        'description': e.get("description", ""),
                        'date': e.get("date", ""),
                        'link_url': e.get("link_url", ""),
                        'scraped_at': e.get("scraped_at", ""),
                    })
        
        return jsonify({
            'success': True,
            'count': len(exam_schedules),
            'exam_schedules': exam_schedules
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch exam schedules: {str(e)}'}), 500

@api_bp.route('/updates/<int:update_id>')
def get_update_by_id(update_id):
    """Get specific update by ID"""
    try:
        response = supabase.table("gtu_updates").select("*").eq("id", update_id).execute()
        
        if response.data and len(response.data) > 0:
            u = response.data[0]
            update = {
                'id': u.get("id", 0),
                'category': u.get("category", ""),
                'title': u.get("title", ""),
                'description': u.get("description", ""),
                'date': u.get("date", ""),
                'link_url': u.get("link_url", ""),
                'scraped_at': u.get("scraped_at", ""),
            }
            return jsonify({
                'success': True,
                'update': update
            }), 200
        else:
            return jsonify({'error': 'Update not found'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch update: {str(e)}'}), 500

@api_bp.route('/study-materials/<int:subject_id>')
def get_study_materials(subject_id):
    """Get study materials for a subject - Returns only high-quality, verified materials"""
    try:
        # First get subject_code from subject_id
        subject_response = supabase.table("subjects").select("subject_code").eq("id", subject_id).execute()
        
        if not subject_response.data:
            return jsonify({'materials': []})
        
        subject_code = subject_response.data[0]['subject_code']
        
        # Fetch high-quality, verified notes (multiple trusted sources)
        response = supabase.table("notes").select("*")\
            .eq("subject_code", subject_code)\
            .or_("source_name.eq.AI-Generated (GTU Exam Prep),source_name.eq.GTUStudy - Verified,source_name.eq.GTUMaterial - Curated")\
            .order("unit")\
            .execute()
        
        materials = []
        if response.data:
            for m in response.data:
                if isinstance(m, dict):
                    materials.append({
                        'id': m.get("id", 0),
                        'title': m.get("title", ""),
                        'content': m.get("file_url", ""),  # URL to PDF
                        'material_type': 'notes',  # Keep consistent with frontend
                        'created_at': m.get("created_at", ""),
                        'unit': m.get("unit"),
                        'description': m.get("description", ""),
                        'downloads': m.get("downloads", 0),
                        'views': m.get("views", 0)
                    })
        return jsonify({'materials': materials})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch study materials: {str(e)}'}), 500

@api_bp.route('/study-materials', methods=['POST'])
def create_study_material():
    """Create a new study material"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['subject_code', 'title', 'material_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare data for insertion
        new_material = {
            'subject_code': data['subject_code'],
            'title': data['title'],
            'material_type': data['material_type'],
            'description': data.get('description', ''),
            'unit': int(data['unit']) if data.get('unit') else None,
            'file_url': data.get('file_url', ''),
            'uploaded_by': data.get('uploaded_by'), # UUID
            'created_at': 'now()'
        }
        
        # Insert into Supabase
        response = supabase.table('study_materials').insert(new_material).execute()
        
        if response.data:
            return jsonify({'success': True, 'material': response.data[0]}), 201
        else:
            return jsonify({'error': 'Failed to create material'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Failed to create material: {str(e)}'}), 500

@api_bp.route('/study-materials/search')
def search_study_materials():
    """Search study materials"""
    try:
        query_text = request.args.get('q', '')
        subject_code = request.args.get('subject')
        material_type = request.args.get('type')
        unit = request.args.get('unit')
        
        query = supabase.table("study_materials").select("*")
        
        if query_text:
            query = query.ilike('title', f'%{query_text}%')
        if subject_code:
            query = query.eq('subject_code', subject_code)
        if material_type:
            query = query.eq('material_type', material_type)
        if unit:
            query = query.eq('unit', unit)
            
        response = query.limit(20).execute()
        return jsonify({'materials': response.data if response.data else []})
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

@api_bp.route('/study-materials/advanced/<string:subject_code>')
def get_advanced_study_materials(subject_code):
    """Get study materials with filtering from new tables"""
    try:
        material_type = request.args.get('type')
        unit = request.args.get('unit')
        
        materials = []
        
        # If type is notes or not specified, fetch from notes table
        if not material_type or material_type == 'notes':
            query = supabase.table("notes").select("*").eq("subject_code", subject_code)
            if unit:
                query = query.eq("unit", unit)
            response = query.order("created_at", desc=True).execute()
            if response.data:
                # Add material_type='notes' to each item for frontend consistency
                for item in response.data:
                    item['material_type'] = 'notes'
                    item['type'] = 'notes' # Keep for backward compat if needed
                materials.extend(response.data)
                
        # If type is book/ppt/video or not specified, fetch from reference_materials
        if not material_type or material_type in ['book', 'ppt', 'video']:
            query = supabase.table("reference_materials").select("*").eq("subject_code", subject_code)
            if material_type:
                query = query.eq("material_type", material_type)
            response = query.order("created_at", desc=True).execute()
            if response.data:
                # Map reference fields to match expected frontend structure if needed
                for item in response.data:
                    item['file_url'] = item.get('url') # Map url to file_url for consistency
                    item['material_type'] = item.get('material_type')
                    item['type'] = item.get('material_type')
                materials.extend(response.data)
            
        return jsonify({'materials': materials})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch materials: {str(e)}'}), 500

@api_bp.route('/video-playlists/<string:subject_code>')
def get_video_playlists(subject_code):
    """Get video playlists for a subject"""
    try:
        response = supabase.table("video_playlists").select("*").eq("subject_code", subject_code).execute()
        return jsonify({'playlists': response.data if response.data else []})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch playlists: {str(e)}'}), 500

@api_bp.route('/lab-programs/<string:subject_code>')
def get_lab_programs(subject_code):
    """Get lab programs for a subject"""
    try:
        response = supabase.table("lab_programs").select("*").eq("subject_code", subject_code).order("practical_number").execute()
        return jsonify({'programs': response.data if response.data else []})
    except Exception as e:
        return jsonify({'error': f'Failed to fetch lab programs: {str(e)}'}), 500

@api_bp.route('/syllabus/details/<string:subject_code>')
def get_syllabus_details(subject_code):
    """Get comprehensive syllabus details organized by unit"""
    try:
        # 1. Fetch all syllabus content
        syllabus_response = supabase.table("syllabus_content").select("*").eq("subject_code", subject_code).order("unit").execute()
        syllabus_data = syllabus_response.data if syllabus_response.data else []

        # 2. Fetch all notes
        notes_response = supabase.table("notes").select("*").eq("subject_code", subject_code).execute()
        notes_data = notes_response.data if notes_response.data else []

        # 3. Fetch all important questions
        questions_response = supabase.table("important_questions").select("*").eq("subject_code", subject_code).execute()
        questions_data = questions_response.data if questions_response.data else []

        # 4. Fetch all reference materials (books/videos)
        refs_response = supabase.table("reference_materials").select("*").eq("subject_code", subject_code).execute()
        refs_data = refs_response.data if refs_response.data else []

        # 5. Aggregate by Unit
        units = {}
        
        # Process syllabus topics first to establish units
        for item in syllabus_data:
            u = item.get('unit')
            if u not in units:
                units[u] = {
                    'unit': u,
                    'title': item.get('unit_title', f'Unit {u}'),
                    'topics': [],
                    'notes': [],
                    'questions': [],
                    'references': [] # References might not be unit-specific, but we can try
                }
            units[u]['topics'].append(item)

        # Process notes
        for note in notes_data:
            u = note.get('unit')
            if u:
                if u not in units:
                    units[u] = {'unit': u, 'title': f'Unit {u}', 'topics': [], 'notes': [], 'questions': [], 'references': []}
                units[u]['notes'].append(note)

        # Process questions
        for q in questions_data:
            u = q.get('unit')
            if u:
                if u not in units:
                    units[u] = {'unit': u, 'title': f'Unit {u}', 'topics': [], 'notes': [], 'questions': [], 'references': []}
                units[u]['questions'].append(q)

        # Convert dict to sorted list
        sorted_units = sorted(units.values(), key=lambda x: x['unit'])

        return jsonify({
            'subject_code': subject_code,
            'units': sorted_units,
            'general_references': refs_data # References often apply to whole subject
        })

    except Exception as e:
        return jsonify({'error': f'Failed to fetch syllabus details: {str(e)}'}), 500

@api_bp.route('/bookmarks', methods=['POST', 'DELETE'])
def manage_bookmarks():
    """Manage user bookmarks"""
    try:
        data = request.get_json()
        user_id = data.get('user_id') # In real app, get from JWT
        material_id = data.get('material_id')
        
        if not user_id or not material_id:
            return jsonify({'error': 'Missing required fields'}), 400
            
        if request.method == 'POST':
            supabase.table("bookmarked_materials").insert({
                "user_id": user_id,
                "material_id": material_id
            }).execute()
            return jsonify({'success': True, 'message': 'Bookmarked successfully'})
            
        elif request.method == 'DELETE':
            supabase.table("bookmarked_materials").delete().match({
                "user_id": user_id,
                "material_id": material_id
            }).execute()
            return jsonify({'success': True, 'message': 'Bookmark removed'})
            
    except Exception as e:
        return jsonify({'error': f'Bookmark operation failed: {str(e)}'}), 500

@api_bp.route('/ratings', methods=['POST'])
def submit_rating():
    """Submit material rating"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        material_id = data.get('material_id')
        rating = data.get('rating')
        if not all([user_id, material_id, rating]):
            return jsonify({'error': 'Missing required fields'}), 400
            
        supabase.table("material_ratings").upsert({
            "user_id": user_id,
            "material_id": material_id,
            "rating": rating
        }).execute()
        
        return jsonify({'success': True, 'message': 'Rating submitted'})
    except Exception as e:
        return jsonify({'error': f'Rating failed: {str(e)}'}), 500

@api_bp.route('/generate-unit-pdf', methods=['POST'])
def generate_unit_pdf_endpoint():
    """
    Generate AI-powered comprehensive PDF study guide for a unit
    """
    try:
        from backend.pdf_generator import generate_unit_pdf
        
        data = request.get_json()
        subject_code = data.get('subject_code')
        unit_number = data.get('unit_number')
        
        if not subject_code or not unit_number:
            return jsonify({'error': 'subject_code and unit_number are required'}), 400
        
        # Generate the PDF
        result = generate_unit_pdf(subject_code, int(unit_number))
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'PDF generation failed: {str(e)}'}), 500


# ============================================================================
# STUDY MATERIAL AGGREGATION ENDPOINTS
# ============================================================================

@api_bp.route('/notes/<string:subject_code>')
def get_notes_by_subject(subject_code):
    """Get all notes for a subject with optional unit filter"""
    try:
        unit = request.args.get('unit', type=int)
        
        query = supabase.table("notes").select("*").eq("subject_code", subject_code)
        
        if unit:
            query = query.eq("unit", unit)
            
        response = query.order("unit").order("created_at", desc=True).execute()
        
        notes = []
        if response.data:
            for n in response.data:
                notes.append({
                    'id': n.get('id'),
                    'subject_code': n.get('subject_code'),
                    'subject_name': n.get('subject_name'),
                    'unit': n.get('unit'),
                    'title': n.get('title'),
                    'description': n.get('description'),
                    'file_url': n.get('file_url'),
                    'source_url': n.get('source_url'),
                    'source_name': n.get('source_name'),
                    'downloads': n.get('downloads', 0),
                    'views': n.get('views', 0),
                    'is_verified': n.get('is_verified', False),
                    'created_at': n.get('created_at')
                })
        
        return jsonify({
            'success': True,
            'count': len(notes),
            'notes': notes
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch notes: {str(e)}'}), 500

@api_bp.route('/reference-materials/<string:subject_code>')
def get_reference_materials(subject_code):
    """Get reference materials with optional type filter"""
    try:
        material_type = request.args.get('type')  # book, pdf, video, link
        
        query = supabase.table("reference_materials").select("*").eq("subject_code", subject_code)
        
        if material_type:
            query = query.eq("material_type", material_type)
            
        response = query.order("material_type").order("title").execute()
        
        materials = []
        if response.data:
            for m in response.data:
                materials.append({
                    'id': m.get('id'),
                    'subject_code': m.get('subject_code'),
                    'subject_name': m.get('subject_name'),
                    'material_type': m.get('material_type'),
                    'title': m.get('title'),
                    'author': m.get('author'),
                    'description': m.get('description'),
                    'url': m.get('url'),
                    'source_url': m.get('source_url'),
                    'source_name': m.get('source_name'),
                    'isbn': m.get('isbn'),
                    'publisher': m.get('publisher'),
                    'year': m.get('year'),
                    'rating': float(m.get('rating')) if m.get('rating') else None
                })
        
        return jsonify({
            'success': True,
            'count': len(materials),
            'materials': materials
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch reference materials: {str(e)}'}), 500

@api_bp.route('/syllabus-content/<string:subject_code>')
def get_syllabus_content(subject_code):
    """Get detailed syllabus content with topics"""
    try:
        unit = request.args.get('unit', type=int)
        
        query = supabase.table("syllabus_content").select("*").eq("subject_code", subject_code)
        
        if unit:
            query = query.eq("unit", unit)
            
        response = query.order("unit").execute()
        
        content = []
        if response.data:
            for c in response.data:
                content.append({
                    'id': c.get('id'),
                    'subject_code': c.get('subject_code'),
                    'subject_name': c.get('subject_name'),
                    'unit': c.get('unit'),
                    'unit_title': c.get('unit_title'),
                    'topic': c.get('topic'),
                    'content': c.get('content'),
                    'source_url': c.get('source_url')
                })
        
        return jsonify({
            'success': True,
            'count': len(content),
            'syllabus_content': content
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch syllabus content: {str(e)}'}), 500

@api_bp.route('/materials/browse')
def browse_materials():
    """Browse materials by branch, semester, subject hierarchy"""
    try:
        branch = request.args.get('branch')
        semester = request.args.get('semester')
        subject_code = request.args.get('subject_code')
        
        if not subject_code:
            # If no subject code, return available subjects for branch/semester
            query = supabase.table("subjects").select("*")
            
            if branch:
                query = query.eq("branch", branch)
            if semester:
                query = query.eq("semester", semester)
                
            response = query.execute()
            
            return jsonify({
                'success': True,
                'subjects': response.data if response.data else []
            }), 200
        
        # If subject code provided, return all materials for that subject
        # Gather data from multiple tables
        materials = {}
        
        # Get notes
        notes_response = supabase.table("notes").select("*").eq("subject_code", subject_code).execute()
        materials['notes'] = notes_response.data if notes_response.data else []
        
        # Get important questions
        questions_response = supabase.table("important_questions").select("*").eq("subject_code", subject_code).execute()
        materials['questions'] = questions_response.data if questions_response.data else []
        
        # Get reference materials
        references_response = supabase.table("reference_materials").select("*").eq("subject_code", subject_code).execute()
        materials['references'] = references_response.data if references_response.data else []
        
        # Get syllabus content
        syllabus_response = supabase.table("syllabus_content").select("*").eq("subject_code", subject_code).execute()
        materials['syllabus_content'] = syllabus_response.data if syllabus_response.data else []
        
        # Get subject info
        subject_response = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
        subject_info = subject_response.data[0] if subject_response.data else None
        
        return jsonify({
            'success': True,
            'subject': subject_info,
            'materials': materials
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to browse materials: {str(e)}'}), 500

@api_bp.route('/materials/search')
def search_materials():
    """Advanced search across all material types"""
    try:
        query_text = request.args.get('q', '')
        subject_code = request.args.get('subject')
        unit = request.args.get('unit', type=int)
        material_type = request.args.get('type')  # notes, questions, references
        marks = request.args.get('marks', type=int)
        
        results = {
            'notes': [],
            'questions': [],
            'references': []
        }
        
        # Search in notes
        if not material_type or material_type == 'notes':
            notes_query = supabase.table("notes").select("*")
            
            if query_text:
                notes_query = notes_query.or_(f"title.ilike.%{query_text}%,description.ilike.%{query_text}%")
            if subject_code:
                notes_query = notes_query.eq("subject_code", subject_code)
            if unit:
                notes_query = notes_query.eq("unit", unit)
                
            notes_response = notes_query.limit(20).execute()
            results['notes'] = notes_response.data if notes_response.data else []
        
        # Search in important questions
        if not material_type or material_type == 'questions':
            questions_query = supabase.table("important_questions").select("*")
            
            if query_text:
                questions_query = questions_query.ilike("question_text", f"%{query_text}%")
            if subject_code:
                questions_query = questions_query.eq("subject_code", subject_code)
            if unit:
                questions_query = questions_query.eq("unit", unit)
            if marks:
                questions_query = questions_query.eq("marks", marks)
                
            questions_response = questions_query.order("frequency", desc=True).limit(20).execute()
            results['questions'] = questions_response.data if questions_response.data else []
        
        # Search in reference materials
        if not material_type or material_type == 'references':
            references_query = supabase.table("reference_materials").select("*")
            
            if query_text:
                references_query = references_query.or_(f"title.ilike.%{query_text}%,description.ilike.%{query_text}%,author.ilike.%{query_text}%")
            if subject_code:
                references_query = references_query.eq("subject_code", subject_code)
                
            references_response = references_query.limit(20).execute()
            results['references'] = references_response.data if references_response.data else []
        
        total_count = len(results['notes']) + len(results['questions']) + len(results['references'])
        
        return jsonify({
            'success': True,
            'query': query_text,
            'total_count': total_count,
            'results': results
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Search failed: {str(e)}'}), 500

@api_bp.route('/materials/recent')
def get_recent_materials():
    """Get recently added materials across all types"""
    try:
        days = request.args.get('days', 7, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        from datetime import datetime, timedelta
        cutoff_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
        
        # Get recent notes
        notes_response = supabase.table("notes").select("*").gte("created_at", cutoff_date).order("created_at", desc=True).limit(limit).execute()
        
        # Get recent questions
        questions_response = supabase.table("important_questions").select("*").gte("created_at", cutoff_date).order("created_at", desc=True).limit(limit).execute()
        
        # Get recent references
        references_response = supabase.table("reference_materials").select("*").gte("created_at", cutoff_date).order("created_at", desc=True).limit(limit).execute()
        
        return jsonify({
            'success': True,
            'period_days': days,
            'recent_materials': {
                'notes': notes_response.data if notes_response.data else [],
                'questions': questions_response.data if questions_response.data else [],
                'references': references_response.data if references_response.data else []
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch recent materials: {str(e)}'}), 500

@api_bp.route('/material-sources')
def get_material_sources():
    """Get all material sources and their scraping status"""
    try:
        response = supabase.table("material_sources").select("*").eq("is_active", True).execute()
        
        sources = []
        if response.data:
            for s in response.data:
                sources.append({
                    'id': s.get('id'),
                    'source_name': s.get('source_name'),
                    'base_url': s.get('base_url'),
                    'last_scraped_at': s.get('last_scraped_at'),
                    'scrape_frequency': s.get('scrape_frequency')
                })
        
        return jsonify({
            'success': True,
            'sources': sources
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch material sources: {str(e)}'}), 500

# ===== Flashcard Routes =====
@api_bp.route('/flashcards/<subject_code>')
def get_flashcards(subject_code):
    """Get all flashcards for a subject"""
    try:
        response = supabase.table("flashcards").select("*").eq("subject_code", subject_code).execute()
        
        flashcards = response.data if response.data else []
        
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'count': len(flashcards)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch flashcards: {str(e)}'}), 500

@api_bp.route('/flashcards/<subject_code>/<int:unit>')
def get_flashcards_by_unit(subject_code, unit):
    """Get flashcards for a specific unit"""
    try:
        response = supabase.table("flashcards").select("*").eq("subject_code", subject_code).eq("unit", unit).execute()
        
        flashcards = response.data if response.data else []
        
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'unit': unit,
            'count': len(flashcards)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch unit flashcards: {str(e)}'}), 500

@api_bp.route('/flashcards/<subject_code>/random')
def get_random_flashcards(subject_code):
    """Get random flashcards for review"""
    try:
        count = request.args.get('count', 10, type=int)
        response = supabase.table("flashcards").select("*").eq("subject_code", subject_code).execute()
        
        flashcards = response.data if response.data else []
        
        # Shuffle and limit
        import random
        random.shuffle(flashcards)
        flashcards = flashcards[:count]
        
        return jsonify({
            'success': True,
            'flashcards': flashcards,
            'count': len(flashcards)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch random flashcards: {str(e)}'}), 500

# ===== AI Chat Routes =====
@api_bp.route('/ai-chat/subject', methods=['POST'])
def subject_chat():
    """Subject-specific AI chat"""
    try:
        data = request.json
        subject_code = data.get('subject_code')
        question = data.get('question')
        chat_history = data.get('chat_history', [])
        
        if not subject_code or not question:
            return jsonify({'error': 'Subject code and question are required'}), 400
        
        # Get subject details
        subject_response = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
        subject_name = subject_response.data[0]['subject_name'] if subject_response.data else subject_code
        
        # Get syllabus topics for context
        syllabus_response = supabase.table("syllabus_content").select("*").eq("subject_code", subject_code).execute()
        topics = [item['topic'] for item in (syllabus_response.data if syllabus_response.data else [])]
        
        # Build context for AI
        context = f"""You are an expert AI tutor for {subject_name} ({subject_code}).
The subject covers the following topics: {', '.join(topics[:15]) if topics else 'Various topics'}.

Your role is to:
- Answer student questions clearly and accurately
- Provide detailed explanations with examples
- Help students understand difficult concepts
- Suggest study strategies and exam preparation tips
- Use simple language that students can understand

Always be encouraging and supportive."""

        # Use Bytez AI directly via AIProcessor
        from backend.ai import ai_processor
        
        # Build full prompt with chat history
        full_prompt = ""
        if chat_history:
            for msg in chat_history[-5:]:  # Last 5 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                full_prompt += f"{role.capitalize()}: {content}\n"
        
        full_prompt += f"Student: {question}"
        
        # Generate response using Bytez GPT-4o
        ai_response = ai_processor.generate_response(full_prompt, context=context)
        
        return jsonify({
            'success': True,
            'response': ai_response
        }), 200
        
    except Exception as e:
        logger.error(f"Subject chat error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to process chat request: {str(e)}'}), 500


@api_bp.route('/ai-chat/explain-topic', methods=['POST'])
def explain_topic():
    """Get detailed explanation of a topic"""
    try:
        data = request.json
        subject_code = data.get('subject_code')
        topic = data.get('topic')
        
        if not subject_code or not topic:
            return jsonify({'error': 'Subject code and topic are required'}), 400
        
        # Get subject name
        subject_response = supabase.table("subjects").select("*").eq("subject_code", subject_code).execute()
        subject_name = subject_response.data[0]['subject_name'] if subject_response.data else subject_code
        
        # Build context for comprehensive explanation
        context = f"""You are an expert educator explaining concepts from {subject_name} ({subject_code}).

Your goal is to provide a comprehensive, well-structured explanation that helps students learn effectively.

Format your response with:
- Clear headings (use ** for bold)
- Bullet points for key concepts
- Examples where relevant
- Simple, student-friendly language"""

        # Build the explanation prompt
        prompt = f"""Provide a detailed explanation of '{topic}' in the context of {subject_name}.

Include:
1. **Definition and Core Concepts**: What is {topic}? What are the fundamental principles?
2. **Key Points to Remember**: The most important facts and concepts students should memorize
3. **Real-World Applications**: Where and how is this used in practice?
4. **Common Exam Questions**: Types of questions students might face about this topic
5. **Study Tips**: How to best understand and remember this concept

Make it comprehensive but easy to understand."""

        # Use Bytez AI directly
        from backend.ai import ai_processor
        explanation = ai_processor.generate_response(prompt, context=context)
        
        return jsonify({
            'success': True,
            'explanation': explanation
        }), 200
        
    except Exception as e:
        logger.error(f"Explain topic error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to generate explanation: {str(e)}'}), 500

@api_bp.route('/generate-notes', methods=['POST'])
def generate_notes():
    """
    Generate study notes for a subject/unit using AI
    """
    try:
        data = request.get_json()
        subject_code = data.get('subject_code')
        unit = data.get('unit')
        topic = data.get('topic')
        
        if not subject_code:
            return jsonify({'error': 'Subject code is required'}), 400
            
        # Generate notes using AI
        prompt = f"Generate detailed study notes for GTU subject {subject_code}"
        if unit:
            prompt += f", Unit {unit}"
        if topic:
            prompt += f", Topic: {topic}"
            
        prompt += ". Provide clear, structured notes with key points, examples, and explanations."
        
        context = "You are an expert GTU tutor creating study notes for students."
        notes = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'message': notes,
            'suggestions': [
                "What are the key concepts I should focus on?",
                "Can you provide examples for better understanding?",
                "How can I apply this in practical scenarios?"
            ]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to generate notes: {str(e)}'}), 500

@api_bp.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    """
    Generate a practice quiz for a subject using AI
    """
    try:
        data = request.get_json()
        subject_code = data.get('subject_code')
        difficulty = data.get('difficulty', 'medium')
        topics = data.get('topics', [])
        
        if not subject_code:
            return jsonify({'error': 'Subject code is required'}), 400
            
        # Generate quiz using AI
        prompt = f"Generate a practice quiz for GTU subject {subject_code} with {difficulty} difficulty level."
        if topics:
            prompt += f" Topics: {', '.join(topics)}"
            
        prompt += ". Create 5-10 multiple choice questions with 4 options each and indicate the correct answer."
        
        context = "You are an expert GTU exam creator designing practice quizzes for students."
        quiz = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'message': quiz,
            'suggestions': [
                "Can you explain the answers?",
                "Generate another quiz with different topics",
                "Focus on my weak areas"
            ]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to generate quiz: {str(e)}'}), 500

@api_bp.route('/important-questions', methods=['POST'])
def get_important_questions_ai():
    """
    Get important questions for a subject using AI
    """
    try:
        data = request.get_json()
        subject_code = data.get('subject_code')
        subject_name = data.get('subject_name')
        unit = data.get('unit')
        
        if not subject_code or not subject_name:
            return jsonify({'error': 'Subject code and name are required'}), 400
            
        # Generate important questions using AI
        prompt = f"List the most important questions for GTU subject {subject_name} ({subject_code})"
        if unit:
            prompt += f" Unit {unit}"
            
        prompt += ". Focus on frequently asked questions in GTU exams with high probability of appearing."
        
        context = "You are an experienced GTU examiner who knows which questions are most likely to appear in exams."
        questions = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'message': questions,
            'suggestions': [
                "Can you provide detailed answers?",
                "Focus on numerical problems",
                "Include diagram-based questions"
            ]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to generate questions: {str(e)}'}), 500

@api_bp.route('/previous-papers', methods=['POST'])
def get_previous_papers_ai():
    """
    Get previous year papers information using AI
    """
    try:
        data = request.get_json()
        subject_code = data.get('subject_code')
        subject_name = data.get('subject_name')
        year = data.get('year')
        
        if not subject_code or not subject_name:
            return jsonify({'error': 'Subject code and name are required'}), 400
            
        # Generate previous papers information using AI
        prompt = f"Provide information about previous year papers for GTU subject {subject_name} ({subject_code})"
        if year:
            prompt += f" from year {year}"
            
        prompt += ". Include exam patterns, important topics, and marking schemes."
        
        context = "You are a GTU exam expert who understands past exam patterns and trends."
        papers_info = ai_processor.generate_response(prompt, context)
        
        return jsonify({
            'success': True,
            'message': papers_info,
            'suggestions': [
                "Show me the marking scheme",
                "Focus on recent years",
                "Include sample solutions"
            ]
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': f'Failed to generate papers info: {str(e)}'}), 500
