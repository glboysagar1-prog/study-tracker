BOT_NAME = 'gtu_scraper'

SPIDER_MODULES = ['gtu_scraper.spiders']
NEWSPIDER_MODULE = 'gtu_scraper.spiders'

# Obey robots.txt rules
ROBOTSTXT_OBEY = True

# Download delay (in seconds)
DOWNLOAD_DELAY = 2

# Concurrent requests settings
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 1

# User agent
USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

# Configure item pipelines
ITEM_PIPELINES = {
   'gtu_scraper.pipelines.SupabasePipeline': 300,
}