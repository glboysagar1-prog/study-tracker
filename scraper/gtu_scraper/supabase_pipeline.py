"""Supabase pipeline for storing scraped GTU data"""
from itemadapter import ItemAdapter
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class SupabasePipeline:
    """Pipeline to store GTU updates in Supabase"""
    
    def __init__(self):
        # Initialize Supabase client
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def open_spider(self, spider):
        """Called when spider opens"""
        spider.logger.info(f"Opened spider {spider.name} with Supabase pipeline")
    
    def process_item(self, item, spider):
        """Process each scraped item"""
        adapter = ItemAdapter(item)
        
        # Determine which table to use based on item class
        item_class_name = item.__class__.__name__
        
        if item_class_name in ['GtuCircularItem', 'GtuNewsItem', 'GtuExamScheduleItem']:
            self.store_update(adapter, spider)
        elif item_class_name == 'GtuSyllabusItem':
            self.store_syllabus(adapter, spider)
        elif item_class_name == 'PreviousPaperItem':
            self.store_previous_paper(adapter, spider)
        elif item_class_name == 'StudyMaterialItem':
            self.store_study_material(adapter, spider)
        elif item_class_name == 'NotesItem':
            self.store_notes(adapter, spider)
        elif item_class_name == 'ReferenceMaterialItem':
            self.store_reference_material(adapter, spider)
        elif item_class_name == 'SyllabusContentItem':
            self.store_syllabus_content(adapter, spider)
        elif item_class_name == 'ImportantQuestionItem':
            self.store_important_question(adapter, spider)
        
        return item
    
    def store_update(self, adapter, spider):
        """Store GTU update (circular/news/exam schedule) in Supabase"""
        content_hash = adapter.get('content_hash')
        
        try:
            # Check if item already exists (by content hash)
            response = self.supabase.table('gtu_updates').select('id, content_hash').eq('content_hash', content_hash).execute()
            
            if response.data and len(response.data) > 0:
                # Item already exists, skip
                spider.logger.info(f"Duplicate update skipped: {adapter.get('title')}")
                return
            
            # Insert new update
            data = {
                'category': adapter.get('category'),
                'title': adapter.get('title'),
                'description': adapter.get('description', ''),
                'date': adapter.get('date'),
                'link_url': adapter.get('link_url', ''),
                'content_hash': content_hash,
                'is_latest': True,
                'scraped_at': adapter.get('scraped_at'),
            }
            
            response = self.supabase.table('gtu_updates').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New {adapter.get('category')} saved: {adapter.get('title')}")
            else:
                spider.logger.warning(f"Failed to save update: {adapter.get('title')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing update in Supabase: {str(e)}")
    
    def store_syllabus(self, adapter, spider):
        """Store syllabus data in Supabase (for gtu_syllabus spider)"""
        try:
            # Check if syllabus already exists
            response = self.supabase.table('subjects').select('id').eq('subject_code', adapter.get('subject_code')).eq('course', adapter.get('course')).eq('branch', adapter.get('branch')).eq('semester', adapter.get('semester')).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Syllabus already exists: {adapter.get('subject_name')}")
                return
            
            # Insert new syllabus
            data = {
                'course': adapter.get('course'),
                'branch': adapter.get('branch'),
                'semester': adapter.get('semester'),
                'subject_code': adapter.get('subject_code'),
                'subject_name': adapter.get('subject_name'),
                'credits': adapter.get('credits'),
            }
            
            response = self.supabase.table('subjects').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New syllabus saved: {adapter.get('subject_name')}")
            else:
                spider.logger.warning(f"Failed to save syllabus: {adapter.get('subject_name')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing syllabus in Supabase: {str(e)}")

    def store_previous_paper(self, adapter, spider):
        """Store previous paper in Supabase"""
        try:
            # Check if paper already exists
            # Assuming uniqueness based on subject_code, year, exam_type
            # But we might not have subject_code always populated correctly in the spider yet
            # Let's check by paper_pdf_url if available
            
            query = self.supabase.table('previous_papers').select('id')
            if adapter.get('paper_pdf_url'):
                query = query.eq('paper_pdf_url', adapter.get('paper_pdf_url'))
            else:
                # Fallback check
                return 
                
            response = query.execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Paper already exists: {adapter.get('paper_pdf_url')}")
                return
            
            # Insert new paper
            # We need to resolve subject_id from subject_code or name if possible
            # For now, we might need to skip subject_id or find it
            # This is a complex part: mapping scraped subject to DB subject_id
            # For this implementation, we will try to find subject by name
            
            subject_id = None
            if adapter.get('subject_name'):
                 sub_res = self.supabase.table('subjects').select('id').ilike('subject_name', f"%{adapter.get('subject_name')}%").limit(1).execute()
                 if sub_res.data:
                     subject_id = sub_res.data[0]['id']
            
            if not subject_id:
                spider.logger.warning(f"Could not find subject for paper: {adapter.get('subject_name')}")
                return

            data = {
                'subject_id': subject_id,
                'year': adapter.get('year'),
                'exam_type': adapter.get('exam_type'),
                'paper_pdf_url': adapter.get('paper_pdf_url'),
                'solution_pdf_url': adapter.get('solution_pdf_url')
            }
            
            response = self.supabase.table('previous_papers').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New paper saved: {adapter.get('paper_pdf_url')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing paper in Supabase: {str(e)}")

    def store_study_material(self, adapter, spider):
        """Store study material in Supabase"""
        try:
            # Check if material already exists
            response = self.supabase.table('study_materials').select('id').eq('content', adapter.get('content_url')).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Material already exists: {adapter.get('title')}")
                return
            
            # Resolve subject_id
            subject_id = None
            if adapter.get('subject_name'):
                 sub_res = self.supabase.table('subjects').select('id').ilike('subject_name', f"%{adapter.get('subject_name')}%").limit(1).execute()
                 if sub_res.data:
                     subject_id = sub_res.data[0]['id']
            
            if not subject_id:
                spider.logger.warning(f"Could not find subject for material: {adapter.get('subject_name')}")
                return

            data = {
                'subject_id': subject_id,
                'title': adapter.get('title'),
                'content': adapter.get('content_url'),
                'material_type': adapter.get('material_type'),
                'created_at': 'now()'
            }
            
            response = self.supabase.table('study_materials').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New material saved: {adapter.get('title')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing material in Supabase: {str(e)}")
    
    def store_notes(self, adapter, spider):
        """Store notes in Supabase"""
        try:
            content_hash = adapter.get('content_hash')
            
            # Check if note already exists
            response = self.supabase.table('notes').select('id').eq('content_hash', content_hash).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Note already exists: {adapter.get('title')}")
                return
            
            # Insert new note
            data = {
                'subject_code': adapter.get('subject_code'),
                'subject_name': adapter.get('subject_name'),
                'unit': adapter.get('unit'),
                'title': adapter.get('title'),
                'description': adapter.get('description', ''),
                'file_url': adapter.get('file_url'),
                'source_url': adapter.get('source_url'),
                'source_name': adapter.get('source_name'),
                'content_hash': content_hash,
            }
            
            response = self.supabase.table('notes').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New note saved: {adapter.get('title')}")
            else:
                spider.logger.warning(f"Failed to save note: {adapter.get('title')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing note in Supabase: {str(e)}")
    
    def store_reference_material(self, adapter, spider):
        """Store reference material in Supabase"""
        try:
            # Check if material already exists by URL
            url = adapter.get('url')
            response = self.supabase.table('reference_materials').select('id').eq('url', url).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Reference material already exists: {adapter.get('title')}")
                return
            
            # Insert new reference material
            data = {
                'subject_code': adapter.get('subject_code'),
                'subject_name': adapter.get('subject_name'),
                'material_type': adapter.get('material_type'),
                'title': adapter.get('title'),
                'author': adapter.get('author', ''),
                'description': adapter.get('description', ''),
                'url': url,
                'source_url': adapter.get('source_url'),
                'source_name': adapter.get('source_name'),
                'isbn': adapter.get('isbn', ''),
                'publisher': adapter.get('publisher', ''),
                'year': adapter.get('year'),
            }
            
            response = self.supabase.table('reference_materials').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New reference material saved: {adapter.get('title')}")
            else:
                spider.logger.warning(f"Failed to save reference material: {adapter.get('title')}")
                
        except Exception as e:
            spider.logger.error(f"Error storing reference material in Supabase: {str(e)}")
    
    def store_syllabus_content(self, adapter, spider):
        """Store detailed syllabus content in Supabase"""
        try:
            # Check if syllabus content already exists
            subject_code = adapter.get('subject_code')
            unit = adapter.get('unit')
            topic = adapter.get('topic')
            
            response = self.supabase.table('syllabus_content').select('id').eq('subject_code', subject_code).eq('unit', unit).eq('topic', topic).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Syllabus content already exists: {subject_code} Unit {unit} - {topic}")
                return
            
            # Insert new syllabus content
            data = {
                'subject_code': subject_code,
                'subject_name': adapter.get('subject_name'),
                'unit': unit,
                'unit_title': adapter.get('unit_title', ''),
                'topic': topic,
                'content': adapter.get('content', ''),
                'source_url': adapter.get('source_url'),
            }
            
            response = self.supabase.table('syllabus_content').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New syllabus content saved: {subject_code} Unit {unit}")
            else:
                spider.logger.warning(f"Failed to save syllabus content")
                
        except Exception as e:
            spider.logger.error(f"Error storing syllabus content in Supabase: {str(e)}")
    
    def store_important_question(self, adapter, spider):
        """Store important question in Supabase"""
        try:
            content_hash = adapter.get('content_hash')
            
            # Check if question already exists
            response = self.supabase.table('important_questions').select('id').eq('content_hash', content_hash).execute()
            
            if response.data and len(response.data) > 0:
                spider.logger.info(f"Question already exists: {adapter.get('question_text')[:50]}...")
                return
            
            # Insert new question
            data = {
                'subject_code': adapter.get('subject_code'),
                'unit': adapter.get('unit'),
                'question_text': adapter.get('question_text'),
                'marks': adapter.get('marks'),
                'difficulty': adapter.get('difficulty', 'medium'),
                'frequency': adapter.get('frequency', 1),
                'last_asked_year': adapter.get('last_asked_year'),
                'answer_text': adapter.get('answer_text', ''),
                'source_url': adapter.get('source_url'),
                'source_name': adapter.get('source_name'),
            }
            
            response = self.supabase.table('important_questions').insert(data).execute()
            
            if response.data:
                spider.logger.info(f"New important question saved")
            else:
                spider.logger.warning(f"Failed to save important question")
                
        except Exception as e:
            spider.logger.error(f"Error storing important question in Supabase: {str(e)}")
    
    def close_spider(self, spider):
        """Called when spider closes"""
        spider.logger.info(f"Closed spider {spider.name}")
