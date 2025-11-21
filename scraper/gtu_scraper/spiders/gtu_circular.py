import scrapy
from datetime import datetime
import hashlib
from gtu_scraper.items import GtuCircularItem, GtuNewsItem, GtuExamScheduleItem


class GtuCircularSpider(scrapy.Spider):
    name = "gtu_circular"
    allowed_domains = ['gtu.ac.in']
    start_urls = ['https://www.gtu.ac.in/Circular.aspx']
    
    custom_settings = {
        'ROBOTSTXT_OBEY': False,  # GTU site may block robots
        'DOWNLOAD_DELAY': 3,  # 3 seconds between requests to be respectful
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'USER_AGENT': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'DEFAULT_REQUEST_HEADERS': {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
        'RETRY_TIMES': 3,
        'RETRY_HTTP_CODES': [500, 502, 503, 504, 403, 408, 429],
    }
    
    def parse(self, response):
        """Parse the main circular page and extract all updates"""
        
        # Extract Circulars
        circulars = response.css('div.news-outer a')
        for circular in circulars:
            # Extract circular information
            title = circular.css('::text').get()
            link = circular.css('::attr(href)').get()
            
            if title and title.strip():
                # Try to extract date from the title or nearby elements
                date_text = self.extract_date(title)
                
                item = GtuCircularItem()
                item['title'] = title.strip()
                item['description'] = ''
                item['date'] = date_text
                item['link_url'] = response.urljoin(link) if link else ''
                item['category'] = 'circular'
                item['content_hash'] = self.generate_hash(title.strip(), date_text)
                item['scraped_at'] = datetime.now().isoformat()
                
                yield item
        
        # Extract from tables (alternative structure)
        tables = response.css('table.table')
        for table in tables:
            rows = table.css('tr')
            for row in rows:
                cols = row.css('td')
                if len(cols) >= 2:
                    # Typically: [Date | Title/Link]
                    date_text = cols[0].css('::text').get()
                    title_element = cols[1].css('a')
                    
                    if title_element:
                        title = title_element.css('::text').get()
                        link = title_element.css('::attr(href)').get()
                    else:
                        title = cols[1].css('::text').get()
                        link = ''
                    
                    if title and title.strip():
                        item = GtuCircularItem()
                        item['title'] = title.strip()
                        item['description'] = ''
                        item['date'] = self.parse_date(date_text) if date_text else datetime.now().strftime('%Y-%m-%d')
                        item['link_url'] = response.urljoin(link) if link else ''
                        item['category'] = 'circular'
                        item['content_hash'] = self.generate_hash(title.strip(), item['date'])
                        item['scraped_at'] = datetime.now().isoformat()
                        
                        yield item
        
        # Extract News items (if present in a separate section)
        news_section = response.css('div.news-corner, div.news-section')
        for news_item in news_section.css('div.news-item, li'):
            title = news_item.css('::text, a::text').get()
            link = news_item.css('a::attr(href)').get()
            
            if title and title.strip():
                date_text = self.extract_date(title)
                
                item = GtuNewsItem()
                item['title'] = title.strip()
                item['description'] = ''
                item['date'] = date_text
                item['link_url'] = response.urljoin(link) if link else ''
                item['category'] = 'news'
                item['content_hash'] = self.generate_hash(title.strip(), date_text)
                item['scraped_at'] = datetime.now().isoformat()
                
                yield item
        
        # Extract Exam Schedules
        exam_section = response.css('div.exam-schedule, div.exam-section')
        for exam_item in exam_section.css('div.exam-item, li, a'):
            title = exam_item.css('::text').get()
            link = exam_item.css('::attr(href)').get()
            
            if title and title.strip():
                date_text = self.extract_date(title)
                
                item = GtuExamScheduleItem()
                item['title'] = title.strip()
                item['description'] = ''
                item['date'] = date_text
                item['link_url'] = response.urljoin(link) if link else ''
                item['category'] = 'exam_schedule'
                item['content_hash'] = self.generate_hash(title.strip(), date_text)
                item['scraped_at'] = datetime.now().isoformat()
                
                yield item
    
    def extract_date(self, text):
        """Extract date from text string"""
        import re
        
        # Try to find date patterns in the text
        # Format: DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
        date_patterns = [
            r'(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{4})',
            r'(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2})',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(1)
                return self.parse_date(date_str)
        
        # If no date found, use current date
        return datetime.now().strftime('%Y-%m-%d')
    
    def parse_date(self, date_str):
        """Parse date string to YYYY-MM-DD format"""
        if not date_str:
            return datetime.now().strftime('%Y-%m-%d')
        
        date_str = date_str.strip()
        
        # Try different date formats
        formats = [
            '%d-%m-%Y',
            '%d/%m/%Y',
            '%d.%m.%Y',
            '%d-%m-%y',
            '%d/%m/%y',
            '%d.%m.%y',
            '%Y-%m-%d',
        ]
        
        for fmt in formats:
            try:
                dt = datetime.strptime(date_str, fmt)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # If all parsing fails, return current date
        return datetime.now().strftime('%Y-%m-%d')
    
    def generate_hash(self, title, date):
        """Generate unique hash for duplicate detection"""
        content = f"{title}|{date}"
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
