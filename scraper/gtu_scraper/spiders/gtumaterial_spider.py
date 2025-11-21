"""
GTUMaterial.com spider for scraping study materials

This spider scrapes study materials from GTUMaterial website
"""
import scrapy
import hashlib
from datetime import datetime
from gtu_scraper.items import NotesItem, ImportantQuestionItem, ReferenceMaterialItem


class GTUMaterialSpider(scrapy.Spider):
    name = "gtumaterial"
    allowed_domains = ["gtumaterial.com", "www.gtumaterial.com"]
    
    # Start URLs - adjust based on actual site structure
    start_urls = [
        "https://www.gtumaterial.com/notes",
        "https://www.gtumaterial.com/important-questions"
    ]
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 2,
        'ROBOTSTXT_OBEY': True,
        'USER_AGENT': 'GTU Material Aggregator Bot (Educational Purpose)'
    }
    
    def __init__(self, *args, **kwargs):
        super(GTUMaterialSpider, self).__init__(*args, **kwargs)
        self.source_name = "GTUMaterial"
    
    def parse(self, response):
        """
        Parse main page - template implementation
        
        Customize based on GTUMaterial's actual HTML structure
        """
        
        # Find semester/branch/subject links
        subject_links = response.css('a.subject-link::attr(href)').getall()
        
        for link in subject_links:
            yield response.follow(link, callback=self.parse_material_page)
    
    def parse_material_page(self, response):
        """Parse material page for a subject"""
        
        subject_code = self.extract_subject_code(response)
        subject_name = response.css('h1::text, .subject-name::text').get()
        
        # Parse notes
        for note_elem in response.css('.note-item, .material-item'):
            note = self.parse_note(note_elem, subject_code, subject_name, response.url)
            if note:
                yield note
        
        # Parse important questions
        for q_elem in response.css('.question-item'):
            question = self.parse_question(q_elem, subject_code, subject_name, response.url)
            if question:
                yield question
    
    def parse_note(self, selector, subject_code, subject_name, source_url):
        """Parse individual note"""
        title = selector.css('.title::text, a::text').get()
        file_url = selector.css('a::attr(href)').get()
        
        if not title or not file_url:
            return None
        
        # Make absolute URL
        if not file_url.startswith('http'):
            file_url = f"https://www.gtumaterial.com{file_url}"
        
        unit = self.extract_unit(title or '')
        content_hash = hashlib.md5(f"{subject_code}{title}{file_url}".encode()).hexdigest()
        
        item = NotesItem()
        item['subject_code'] = subject_code
        item['subject_name'] = subject_name
        item['unit'] = unit
        item['title'] = title.strip()
        item['description'] = selector.css('.desc::text').get() or ''
        item['file_url'] = file_url
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    def parse_question(self, selector, subject_code, subject_name, source_url):
        """Parse important question"""
        question_text = selector.css('.question::text, p::text').get()
        
        if not question_text:
            return None
        
        marks = self.extract_marks(question_text)
        unit = self.extract_unit(question_text)
        content_hash = hashlib.md5(f"{subject_code}{question_text}".encode()).hexdigest()
        
        item = ImportantQuestionItem()
        item['subject_code'] = subject_code
        item['subject_name'] = subject_name
        item['unit'] = unit
        item['question_text'] = question_text.strip()
        item['marks'] = marks
        item['difficulty'] = 'medium'
        item['frequency'] = 1
        item['last_asked_year'] = None
        item['answer_text'] = ''
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    # Helper methods
    def extract_subject_code(self, response):
        """Extract subject code"""
        import re
        match = re.search(r'/(\d{7})/', response.url)
        if match:
            return match.group(1)
        return response.css('.subject-code::text').get() or 'UNKNOWN'
    
    def extract_unit(self, text):
        """Extract unit number"""
        import re
        if not text:
            return None
        match = re.search(r'[Uu]nit[\s-]*(\d+)', text)
        return int(match.group(1)) if match else None
    
    def extract_marks(self, text):
        """Extract marks from text"""
        import re
        if not text:
            return None
        match = re.search(r'\(?(\d+)\s*[Mm](?:arks?)?\)?', text)
        return int(match.group(1)) if match else None
