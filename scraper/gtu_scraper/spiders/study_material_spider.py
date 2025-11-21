import scrapy
from gtu_scraper.items import StudyMaterialItem

class StudyMaterialSpider(scrapy.Spider):
    name = "study_materials"
    allowed_domains = ["gtu-info.com", "darshan.ac.in"] # Example educational sites
    start_urls = ["https://www.darshan.ac.in/diet/ce/gtu-study-material"]

    def parse(self, response):
        # Example scraping logic for Darshan Institute's GTU material page (which is very structured)
        
        for subject in response.css('.g-mb-30'):
            subject_name = subject.css('h2::text').get()
            
            for material in subject.css('li'):
                item = StudyMaterialItem()
                item['subject_name'] = subject_name
                item['title'] = material.css('a::text').get()
                item['material_type'] = "Note"
                item['content_url'] = material.css('a::attr(href)').get()
                item['description'] = "Scraped study material"
                
                if item['content_url']:
                    yield item
