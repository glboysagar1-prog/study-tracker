# Importing Crawlee Scraped Data

This guide explains how to import data scraped by Crawlee into your Supabase database.

## Quick Start

### Option 1: Direct Crawlee → Supabase (Automatic)

According to your scraper README, data is already being saved directly to Supabase during scraping. Check these tables in your Supabase dashboard:

- `notes` - PDF metadata
- `syllabus_content` - Text content from educational sites

### Option 2: Manual Import from JSON Files

If you have JSON files from Crawlee scraping:

1. **Locate your scraped data**:
   ```bash
   # Crawlee typically saves data in:
   cd scraper/crawlee-scraper/storage/datasets/default/
   
   # Or check for exported JSON files
   find scraper/crawlee-scraper -name "*.json" -type f
   ```

2. **Use the import script**:
   ```bash
   # Import notes/PDFs
   python import_crawlee_data.py --data-file scraped_notes.json --type notes
   
   # Import syllabus content
   python import_crawlee_data.py --data-file scraped_syllabus.json --type syllabus
   
   # Import important questions
   python import_crawlee_data.py --data-file scraped_questions.json --type questions
   
   # Import reference materials (books, links)
   python import_crawlee_data.py --data-file scraped_refs.json --type references
   
   # Import video playlists
   python import_crawlee_data.py --data-file scraped_videos.json --type videos
   ```

## Expected JSON Format

### Notes/PDFs
```json
[
  {
    "subject_code": "3130702",
    "subject_name": "Database Management Systems",
    "unit": 1,
    "title": "Introduction to DBMS",
    "description": "Fundamentals of database systems",
    "file_url": "https://example.com/notes.pdf",
    "source_url": "https://source-website.com",
    "source_name": "GTUStudy"
  }
]
```

### Syllabus Content
```json
[
  {
    "subject_code": "3130702",
    "subject_name": "Database Management Systems",
    "unit": 1,
    "unit_title": "Introduction to DBMS",
    "topic": "Database Architecture",
    "content": "Detailed explanation of database architectures...",
    "source_url": "https://geeksforgeeks.org/dbms"
  }
]
```

### Important Questions
```json
[
  {
    "subject_code": "3130702",
    "subject_name": "Database Management Systems",
    "unit": 2,
    "question_text": "Explain normalization with examples",
    "answer_text": "Normalization is...",
    "marks": 7,
    "difficulty": "medium",
    "frequency": 3,
    "source_url": "https://source.com"
  }
]
```

## Verify Import

After importing, check Supabase:

```bash
# Check imported notes count
python -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY')); print(f'Notes: {len(s.table(\"notes\").select(\"*\").execute().data)}')"

# Check syllabus content count  
python -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY')); print(f'Syllabus: {len(s.table(\"syllabus_content\").select(\"*\").execute().data)}')"
```

## Run Your Scraper

To scrape fresh data:

```bash
cd scraper/crawlee-scraper
npm start
```

This will automatically save to Supabase based on your scraper configuration.

## Troubleshooting

**Issue**: Import script fails with "Missing SUPABASE_URL"
- **Fix**: Ensure `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`

**Issue**: Duplicate key error
- **Fix**: Data already exists. Check if scraper already imported it

**Issue**: JSON format error
- **Fix**: Verify JSON structure matches expected format above

**Issue**: No data in Supabase after scraping
- **Fix**: Check `scraper/crawlee-scraper/src/database.js` has correct Supabase credentials
