# Study Material Aggregation - Setup & Usage Guide

This document provides instructions for setting up and using the comprehensive study material aggregation system.

## Quick Start

### 1. Apply Database Schema

The database schema must be applied to your Supabase instance:

**Option A: Via Supabase Dashboard** (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file: `backend/db/comprehensive_study_material_schema.sql`
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** to execute the schema

**Option B: Via Command Line**
```bash
# If you have psql installed and Supabase connection string
psql '<your-supabase-connection-string>' < backend/db/comprehensive_study_material_schema.sql
```

### 2. Verify Schema Installation

```bash
cd /Users/sagar/Documents/gtu
python3 verify_material_schema.py
```

This will check that all required tables (`notes`, `reference_materials`, `syllabus_content`, `material_sources`, `important_questions`) were created successfully.

### 3. Test Spiders (Optional)

Run the spiders manually to test scraping:

```bash
cd /Users/sagar/Documents/gtu/scraper/gtu_scraper

# Test GTUStudy spider
scrapy crawl gtustudy -o test_gtustudy.json

# Test GTUMaterial spider  
scrapy crawl gtumaterial -o test_gtumaterial.json
```

**Note:** The spiders are templates and need to be customized based on the actual HTML structure of GTUStudy and GTUMaterial websites.

### 4. Start the Backend Server

```bash
cd /Users/sagar/Documents/gtu
python3 run_backend.py
```

Server will run on `http://localhost:5000`

### 5. Start the Frontend

```bash
cd /Users/sagar/Documents/gtu/frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

## New API Endpoints

All endpoints return JSON with source attribution included.

### Notes
- `GET /api/notes/<subject_code>` - Get all notes for a subject
- `GET /api/notes/<subject_code>?unit=1` - Get notes for specific unit

### Reference Materials
- `GET /api/reference-materials/<subject_code>` - Get all references
- `GET /api/reference-materials/<subject_code>?type=book` - Filter by type (book/pdf/video/link)

### Syllabus Content
- `GET /api/syllabus-content/<subject_code>` - Get detailed syllabus with topics
- `GET /api/syllabus-content/<subject_code>?unit=2` - Get specific unit syllabus

### Browse Materials
- `GET /api/materials/browse?branch=Computer&semester=5` - Browse subjects
- `GET /api/materials/browse?subject_code=3140703` - Get all materials for a subject

### Search
- `GET /api/materials/search?q=database` - Search all materials
- `GET /api/materials/search?q=normalization&unit=2&type=notes` - Advanced search with filters

### Recent Materials
- `GET /api/materials/recent` - Get materials added in last 7 days
- `GET /api/materials/recent?days=30&limit=100` - Customize timeframe

### Material Sources
- `GET /api/material-sources` - Get all active scraping sources and their status

## Automated Scraping

To run scrapers on a schedule:

```bash
cd /Users/sagar/Documents/gtu/scraper
python3 scheduler.py
```

This will run all spiders (gtu_syllabus, gtu_circular, gtustudy, gtumaterial) every 24 hours.

To run as a background service, use:
```bash
nohup python3 scheduler.py > scraper.log 2>&1 &
```

## Customizing Spiders

The spiders in `scraper/gtu_scraper/spiders/` are **templates** that need customization:

1. **Inspect Target Websites:**
   - Visit GTUStudy.com and GTUMaterial.com
   - Use browser DevTools to inspect HTML structure
   - Identify CSS selectors for subjects, notes, questions, etc.

2. **Update Spiders:**
   - Edit `gtustudy_spider.py` and `gtumaterial_spider.py`
   - Update `start_urls` with actual URLs
   - Update CSS selectors in `parse()`, `parse_note()`, etc.
   - Test with `scrapy crawl <spider_name>`

3. **Handle Pagination:**
   - Add logic to follow "Next Page" links
   - Use `response.follow()` for pagination

## Next Steps

1. **Apply the database schema** using the instructions above
2. **Verify schema** with the verification script
3. **Test backend APIs** using browser or tools like Postman/curl
4. **Customize spiders** based on actual website structure
5. **Build frontend components** to display the materials
6. **Set up automated scraping** for continuous updates

## File Locations

- **Database Schema:** `backend/db/comprehensive_study_material_schema.sql`
- **Spiders:** `scraper/gtu_scraper/spiders/`
- **Backend Routes:** `backend/api/routes.py`
- **Frontend Components:** `frontend/src/components/` (to be created)

## Support

If you encounter issues:
1. Check that all environment variables are set in `.env`
2. Verify Supabase connection with `python3 test_supabase.py`
3. Check backend logs for errors
4. Inspect browser console for frontend errors
