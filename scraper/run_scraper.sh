#!/bin/bash
cd /Users/sagar/Documents/gtu/scraper/gtu_scraper
source venv/bin/activate  # If using virtual environment
scrapy crawl gtu_syllabus >> /var/log/gtu_scraper.log 2>&1