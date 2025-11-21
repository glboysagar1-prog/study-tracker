"""
Customized GTUStudy spider based on actual website structure
GTUStudy.com provides:
- Study Materials: https://gtustudy.com/gtu-study-material-all-branches/
- Papers: https://gtustudy.com/gtu-paper-free-download/
- Exam Important: https://gtustudy.com/exam-imp-gtu-all-branches-exam-imp/
- Paper Solutions: https://gtustudy.com/paper-solution/
"""
import scrapy
import hashlib
from datetime import datetime
from gtu_scraper.items import NotesItem, ImportantQuestionItem, ReferenceMaterialItem, PreviousPaperItem


class GTUStudyRealSpider(scrapy.Spider):
    name = "gtustudy_real"
    allowed_domains = ["gtustudy.com", "www.gtustudy.com"]
    
    start_urls = [
        "https://gtustudy.com/gtu-study-material-all-branches/",
        "https://gtustudy.com/exam-imp-gtu-all-branches-exam-imp/",
        "https://gtustudy.com/gtu-paper-free-download/",
    ]
    
    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': True,
        'USER_AGENT': 'Mozilla/5.0 (compatible; GTUStudyBot/1.0; +http://gtustudy.com)'
    }
    
    def __init__(self, *args, **kwargs):
        super(GTUStudyRealSpider, self).__init__(*args, **kwargs)
        self.source_name = "GTUStudy"
    
    def parse(self, response):
        """
        Parse main listing pages
        
        GTUStudy structure:
        - Material page: Links to different semester/branch pages
        - Each page has download links in article content
        """
        
        self.logger.info(f"Parsing: {response.url}")
        
        # Find all article links or content sections
        # Typical structure: <article> or <div class="entry-content">
        
        # Look for links in the page that lead to subject materials
        material_links = response.css('article a[href*="gtustudy"], article a[href*="/gtu-"]::attr(href)').getall()
        
        for link in material_links:
            # Filter out navigation links
            if any(skip in link for skip in ['privacy', 'about', 'contact', 'dmca', 'disclaimer', 'home']):
                continue
            
            self.logger.info(f"Following material link: {link}")
            yield response.follow(link, callback=self.parse_material_page)
    
    def parse_material_page(self, response):
        """
        Parse individual material/subject page
        
        These pages typically contain:
        - Download links (Google Drive, Telegram, etc.)
        - Subject information
        - Unit-wise organization
        """
        
        page_title = response.css('h1::text, article header h1::text, .entry-title::text').get()
        if not page_title:
            page_title = response.css('title::text').get()
        
        self.logger.info(f"Parsing material page: {page_title}")
        
        # Extract subject code from title or content
        subject_code = self.extract_subject_code(page_title or '')
        subject_name = self.extract_subject_name(page_title or '')
        
        # Find download links in the content
        # GTUStudy typically uses Google Drive, Telegram, or direct PDFs
        content_area = response.css('article, .entry-content, .post-content')
        
        # Look for download links
        download_links = content_area.css('a[href*="drive.google"], a[href*=".pdf"], a[href*="telegram"]')
        
        for link_elem in download_links:
            link_text = link_elem.css('::text').get() or ''
            link_url = link_elem.css('::attr(href)').get()
            
            if not link_url:
                continue
            
           # Try to determine if it's notes, paper, or important questions
            unit = self.extract_unit(link_text + ' ' + page_title)
            
            # Determine material type based on page URL and content
            if 'exam-imp' in response.url or 'important' in link_text.lower():
                # This is an important questions item
                yield self.create_important_question_item(
                    subject_code, subject_name, unit, link_text, link_url, response.url
                )
            elif 'paper' in response.url.lower() or 'paper' in page_title.lower():
                # This is a previous paper
                yield self.create_paper_item(
                    subject_code, subject_name, link_text, link_url, response.url
                )
            else:
                # This is study material/notes
                yield self.create_notes_item(
                    subject_code, subject_name, unit, link_text, link_url, response.url
                )
    
    def create_notes_item(self, subject_code, subject_name, unit, title, file_url, source_url):
        """Create a notes item"""
        content_hash = hashlib.md5(f"{subject_code}{unit}{title}{file_url}".encode()).hexdigest()
        
        item = NotesItem()
        item['subject_code'] = subject_code or 'UNKNOWN'
        item['subject_name'] = subject_name or title
        item['unit'] = unit
        item['title'] = title.strip() if title else 'Study Material'
        item['description'] = f"Downloaded from GTUStudy - {title}"
        item['file_url'] = file_url
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    def create_important_question_item(self, subject_code, subject_name, unit, title, file_url, source_url):
        """Create important question item - simplified for file-based questions"""
        # For now, create a placeholder question pointing to the PDF
        content_hash = hashlib.md5(f"{subject_code}{title}{file_url}".encode()).hexdigest()
        
        item = ImportantQuestionItem()
        item['subject_code'] = subject_code or 'UNKNOWN'
        item['subject_name'] = subject_name
        item['unit'] = unit
        item['question_text'] = f"Important Questions - {title} (See PDF)"
        item['marks'] = 7  # Default
        item['difficulty'] = 'medium'
        item['frequency'] = 1
        item['last_asked_year'] = datetime.now().year
        item['answer_text'] = f"Download from: {file_url}"
        item['source_url'] = source_url
        item['source_name'] = self.source_name
        item['content_hash'] = content_hash
        item['scraped_at'] = datetime.now().isoformat()
        
        return item
    
    def create_paper_item(self, subject_code, subject_name, title, file_url, source_url):
        """Create previous paper item"""
        year = self.extract_year(title)
        
        item = PreviousPaperItem()
        item['subject_code'] = subject_code or 'UNKNOWN'
        item['subject_name'] = subject_name or title
        item['year'] = str(year) if year else 'Unknown'
        item['exam_type'] = 'Regular'  # Default
        item['paper_pdf_url'] = file_url
        item['solution_pdf_url'] = ''  # May not have solution
        
        return item
    
    # Helper methods
    def extract_subject_code(self, text):
        """Extract subject code from text"""
        import re
        # GTU subject codes are 7 digits
        match = re.search(r'\b(\d{7})\b', text)
        return match.group(1) if match else None
    
    def extract_subject_name(self, text):
        """Extract subject name from title"""
        # Remove common prefixes
        text = text.replace('GTU', '').replace('Study Material', '').replace('Exam Imp', '')
        text = text.strip(' -|')
        return text if text else None
    
    def extract_unit(self, text):
        """Extract unit number"""
        import re
        match = re.search(r'[Uu]nit[\s-]*(\d+)', text)
        return int(match.group(1)) if match else None
    
    def extract_year(self, text):
        """Extract year from text"""
        import re
        # Look for 4-digit year
        match = re.search(r'\b(20\d{2})\b', text)
        return int(match.group(1)) if match else None
