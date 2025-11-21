"""
GTUStudy.com spider for scraping notes, important questions, and study materials

This spider scrapes comprehensive study materials from GTUStudy website
organized by branch, semester, subject, and unit.
"""
import scrapy
import hashlib
from datetime import datetime
from gtu_scraper.items import NotesItem, ImportantQuestionItem, SyllabusContentItem, ReferenceMaterialItem


class GTUStudySpider(scrapy.Spider):
    name = "gtustudy"
    allowed_domains = ["gtustudy.com", "www.gtustudy.com"]
    
    # Start with main subjects page - you'll need to adjust this URL based on actual site structure
    start_urls = [
        "https://www.gtustudy.com/study-material",
        "https://www.gtustudy.com/important-questions"
    ]
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Be polite to the server
        'CONCURRENT_REQUESTS_PER_DOMAIN': 2,
        'ROBOTSTXT_OBEY': True,
        'USER_AGENT': 'GTU Study Material Aggregator Bot (Educational Purpose)'
    }
    
    def __init__(self, *args, **kwargs):
        super(GTUStudySpider, self).__init__(*args, **kwargs)
        self.source_name = "GTUStudy"
    
    def parse(self, response):
        """
        Parse main page to find subject categories
        
        Note: This is a template spider. The actual implementation needs to be
        customized based on GTUStudy's actual HTML structure.
        
        You'll need to:
        1. Inspect the website
        2. Find selectors for branches, semesters, subjects
        3. Update the CSS/XPath selectors below
        """
        
        # Example: Find all subject links
        # Adjust selector based on actual HTML structure
        subject_links = response.css('a.subject-link::attr(href)').getall()
        
        for link in subject_links:
            yield response.follow(link, callback=self.parse_subject_page)
    
    def parse_subject_page(self, response):
        """Parse individual subject page to extract materials"""
        
        # Try to extract subject information from page
        subject_code = self.extract_subject_code(response)
        subject_name = response.css('h1.subject-title::text').get() or response.css('title::text').get()
        
        # Extract notes
        notes_section = response.css('div.notes-section, #notes')
        for note in notes_section.css('div.note-item, li.note'):
            yield self.parse_note(note, subject_code, subject_name, response.url)
        
        # Extract important questions
        questions_section = response.css('div.questions-section, #important-questions')
        for question in questions_section.css('div.question-item, li.question'):
            yield self.parse_question(question, subject_code, subject_name, response.url)
        
        # Extract reference materials
        references_section = response.css('div.references-section, #references')
        for reference in references_section.css('div.reference-item, li.reference'):
            yield self.parse_reference(reference, subject_code, subject_name, response.url)
    
    def parse_note(self, selector, subject_code, subject_name, source_url):
        """Parse a single note item"""
        title = selector.css('a::text, .title::text').get()
        file_url = selector.css('a::attr(href)').get()
        unit = self.extract_unit(title or '')
        
        if not title or not file_url:
            return None
        
        # Make URL absolute
        if file_url and not file_url.startswith('http'):
            file_url = f"https://www.gtustudy.com{file_url}"
        
        # Generate content hash for duplicate detection
        content_hash = hashlib.md5(f"{subject_code}{unit}{title}{file_url}".encode()).hexdigest()
        
        item = NotesItem()
        item['subject_code'] = subject_code
        item['subject_name'] = subject_name
        item['unit'] = unit
        item['title'] = title.strip() if title else ''
        item['description'] = selector.css('.description::text').get() or ''
        item['file_url'] = file_url
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    def parse_question(self, selector, subject_code, subject_name, source_url):
        """Parse a single important question"""
        question_text = selector.css('.question-text::text, p::text').get()
        
        if not question_text:
            return None
        
        # Try to extract marks from text (e.g., "(7 marks)")
        marks = self.extract_marks(question_text)
        unit = self.extract_unit(question_text)
        
        content_hash = hashlib.md5(f"{subject_code}{question_text}".encode()).hexdigest()
        
        item = ImportantQuestionItem()
        item['subject_code'] = subject_code
        item['subject_name'] = subject_name
        item['unit'] = unit
        item['question_text'] = question_text.strip()
        item['marks'] = marks
        item['difficulty'] = self.extract_difficulty(selector)
        item['frequency'] = self.extract_frequency(selector)
        item['last_asked_year'] = self.extract_year(selector)
        item['answer_text'] = selector.css('.answer::text').get() or ''
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    def parse_reference(self, selector, subject_code, subject_name, source_url):
        """Parse a single reference material"""
        title = selector.css('.title::text, a::text').get()
        url = selector.css('a::attr(href)').get()
        
        if not title:
            return None
        
        # Determine material type
        material_type = 'link'
        if 'book' in title.lower():
            material_type = 'book'
        elif 'pdf' in title.lower() or (url and url.endswith('.pdf')):
            material_type = 'pdf'
        elif 'video' in title.lower() or 'youtube' in (url or ''):
            material_type = 'video'
        
        item = ReferenceMaterialItem()
        item['subject_code'] = subject_code
        item['subject_name'] = subject_name
        item['material_type'] = material_type
        item['title'] = title.strip()
        item['author'] = selector.css('.author::text').get() or ''
        item['description'] = selector.css('.description::text').get() or ''
        item['url'] = url or ''
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['isbn'] = selector.css('.isbn::text').get() or ''
        item['publisher'] = selector.css('.publisher::text').get() or ''
        item['year'] = self.extract_year(selector)
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    # Helper methods
    
    def extract_subject_code(self, response):
        """Extract subject code from URL or page content"""
        # Try to find subject code in URL pattern like /subject/3140703
        import re
        url = response.url
        match = re.search(r'/(\d{7})/', url)
        if match:
            return match.group(1)
        
        # Try to find in page content
        code = response.css('.subject-code::text, .code::text').get()
        if code:
            return code.strip()
        
        return 'UNKNOWN'
    
    def extract_unit(self, text):
        """Extract unit number from text"""
        import re
        if not text:
            return None
        
        # Look for patterns like "Unit 1", "Unit-1", "U1", etc.
        match = re.search(r'[Uu]nit[\s-]*(\d+)', text)
        if match:
            return int(match.group(1))
        
        return None
    
    def extract_marks(self, text):
        """Extract marks from question text"""
        import re
        if not text:
            return None
        
        # Look for patterns like "(7 marks)", "7M", "[7]"
        match = re.search(r'\(?(\d+)\s*[Mm](?:arks?)?\)?', text)
        if match:
            return int(match.group(1))
        
        return None
    
    def extract_difficulty(self, selector):
        """Extract difficulty level"""
        difficulty = selector.css('.difficulty::text').get()
        if difficulty:
            return difficulty.strip().lower()
        return 'medium'  # Default
    
    def extract_frequency(self, selector):
        """Extract how frequently question appears"""
        freq = selector.css('.frequency::text').get()
        if freq:
            import re
            match = re.search(r'(\d+)', freq)
            if match:
                return int(match.group(1))
        return 1  # Default
    
    def extract_year(self, selector):
        """Extract year from reference or question"""
        year_text = selector.css('.year::text').get()
        if year_text:
            import re
            match = re.search(r'(\d{4})', year_text)
            if match:
                return int(match.group(1))
        return None
