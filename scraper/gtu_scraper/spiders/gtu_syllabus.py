import scrapy
from datetime import datetime
from gtu_scraper.items import GtuSyllabusItem

class GtuSyllabusSpider(scrapy.Spider):
    name = "gtu_syllabus"
    allowed_domains = ['gtu.ac.in']
    start_urls = ['https://www.gtu.ac.in/syllabus/']
    
    custom_settings = {
        'ROBOTSTXT_OBEY': True,
        'DOWNLOAD_DELAY': 2,  # 2 seconds between requests
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'USER_AGENT': 'GTU-Student-Helper/1.0 (+yourcontact@example.com)'
    }
    
    def parse(self, response):
        # Navigate through course selections
        courses = response.css('select#course option::attr(value)').getall()
        
        for course in courses:
            yield scrapy.FormRequest(
                url=response.url,
                formdata={'course': course},
                callback=self.parse_branches,
                meta={'course': course}
            )
    
    def parse_branches(self, response):
        branches = response.css('select#branch option::attr(value)').getall()
        course = response.meta['course']
        
        for branch in branches:
            yield scrapy.FormRequest(
                url=response.url,
                formdata={'course': course, 'branch': branch},
                callback=self.parse_semesters,
                meta={'course': course, 'branch': branch}
            )
    
    def parse_semesters(self, response):
        semesters = response.css('select#semester option::attr(value)').getall()
        course = response.meta['course']
        branch = response.meta['branch']
        
        for semester in semesters:
            yield scrapy.FormRequest(
                url=response.url,
                formdata={
                    'course': course,
                    'branch': branch,
                    'semester': semester
                },
                callback=self.parse_syllabus,
                meta={'course': course, 'branch': branch, 'semester': semester}
            )
    
    def parse_syllabus(self, response):
        # Extract syllabus information
        subjects = response.css('div.subject-row')
        
        for subject in subjects:
            item = GtuSyllabusItem()
            item['course'] = response.meta['course']
            item['branch'] = response.meta['branch']
            item['semester'] = response.meta['semester']
            item['subject_code'] = subject.css('span.code::text').get()
            item['subject_name'] = subject.css('span.name::text').get()
            item['credits'] = subject.css('span.credits::text').get()
            item['syllabus_pdf_url'] = subject.css('a.download::attr(href)').get()
            item['scraped_at'] = datetime.now().isoformat()
            yield item