# GTU Crawlee Scraper

Advanced web scraper using Crawlee and Playwright to extract syllabus content and PDFs from GTU official website and educational platforms.

## Features

- ✅ **GTU Official Website** - Scrapes authentic syllabus PDFs from gtu.ac.in
- ✅ **Educational Platforms** - GeeksforGeeks, Tutorialspoint, JavaTpoint, Programiz
- ✅ **Smart PDF Detection** - Automatically finds and downloads syllabus PDFs
- ✅ **Content Extraction** - Extracts detailed syllabus topics and content
- ✅ **Database Integration** - Stores all data in Supabase
- ✅ **Polite Crawling** - Respects rate limits and robots.txt

## Installation

```bash
cd scraper/crawlee-scraper
npm install
```

## Usage

### Run the complete scraper

```bash
npm start
```

### Development mode (with auto-reload)

```bash
npm run dev
```

## Configuration

Edit `src/config.js` to:
- Add more target websites
- Configure subject-to-URL mappings
- Adjust crawler settings (concurrency, timeout, etc.)

## How It Works

1. **GTU Official Scraper** (`src/scrapers/gtu-official.js`)
   - Crawls gtu.ac.in/syllabus.aspx and related pages
   - Detects PDF downloads using Playwright
   - Extracts subject codes from filenames/content
   - Saves PDFs to `/tmp/gtu_pdfs/`

2. **Educational Platform Scrapers** (`src/scrapers/geeksforgeeks.js`)
   - Scrapes tutorial content
   - Extracts topics from headings
   - Groups content into units
   - Saves to `syllabus_content` table

3. **Database Module** (`src/database.js`)
   - Connects to Supabase
   - Saves PDFs to `notes` table
   - Saves content to `syllabus_content` table

## Output

- **PDFs**: Saved to `/tmp/gtu_pdfs/` directory
- **Database**: 
  - `notes` table - PDF metadata
  - `syllabus_content` table - Text content

## Environment Variables

Make sure your `.env` file in the root directory contains:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## Crawlee Storage

Crawlee stores intermediate  data in:
- `storage/request_queues/` - URLs to be crawled
- `storage/datasets/` - Scraped data
- `storage/key_value_stores/` - Crawler state

## Notes

- First run may take longer as Playwright downloads browser binaries
- PDF downloads require sufficient disk space in `/tmp/gtu_pdfs/`
- Rate limiting is enabled by default to be polite to websites
- Adjust `maxRequestsPerCrawl` in config to limit scope

## Troubleshooting

**Issue**: PDF download fails
- Check network connectivity
- Verify URL is accessible
- Check disk space in `/tmp/`

**Issue**: Supabase errors
- Verify credentials in `.env`
- Check table schemas match
- Ensure proper network access

**Issue**: Crawler timeout
- Increase `navigationTimeoutSecs` in config
- Check website availability
- Reduce `maxConcurrency`
