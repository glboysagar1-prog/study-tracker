# 🚀 Quick Start: Testing the Material Aggregation System

## Current Status: ⚠️ Schema Not Applied

The verification shows the database schema has **not been applied yet**. This is step 1!

---

## ✅ Step-by-Step Testing Guide

### STEP 1: Apply Database Schema (REQUIRED FIRST)

**Via Supabase Dashboard** (5 minutes):

1. Open https://supabase.com/dashboard
2. Select your GTU project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open file: `backend/db/comprehensive_study_material_schema.sql`
6. Copy entire contents (173 lines)
7. Paste into SQL Editor
8. Click **RUN** (or Ctrl+Enter)
9. Wait for "Success" message

**Verify it worked:**
```bash
cd /Users/sagar/Documents/gtu
python3 verify_material_schema.py
```

You should see: ✓ All tables exist!

---

### STEP 2: Test Backend APIs

**Start the backend:**
```bash
cd /Users/sagar/Documents/gtu
python3 run_backend.py
```

**In another terminal, test the APIs:**
```bash
cd /Users/sagar/Documents/gtu
python3 test_material_apis.py
```

Expected: 9/9 tests passing ✅

**Manual test in browser:**
- http://localhost:5000/api/health
- http://localhost:5000/api/material-sources
- http://localhost:5000/api/subjects/metadata

---

### STEP 3: Add Test Data (Optional)

Since scrapers need customization, let's add sample data:

```bash
cd /Users/sagar/Documents/gtu
python3 add_sample_materials.py
```

This will insert test notes, questions, and references so you can see the system working.

---

### STEP 4: Test Frontend Components

**Start frontend:**
```bash
cd /Users/sagar/Documents/gtu/frontend
npm run dev
```

**Open in browser:**
- Main app: http://localhost:5173
- Subject Browser: http://localhost:5173/browse (after adding route)
- Material Viewer: http://localhost:5173/materials/3140703 (after adding route)

---

### STEP 5: Customize & Run Scrapers

1. **Visit target websites:**
   - https://www.gtustudy.com (if accessible)
   - https://www.gtumaterial.com

2. **Inspect HTML structure** using browser DevTools

3. **Update spider selectors:**
   - Edit: `scraper/gtu_scraper/spiders/gtustudy_spider.py`
   - Update CSS selectors to match actual website

4. **Test scraper:**
   ```bash
   cd /Users/sagar/Documents/gtu/scraper/gtu_scraper
   scrapy crawl gtustudy -o output.json
   ```

5. **Check Supabase** for new data

---

## 📊 Testing Checklist

- [ ] **Database schema applied** (STEP 1) ← START HERE!
- [ ] **Verification script passed**
- [ ] **Backend running on :5000**
- [ ] **API tests passing**
- [ ] **Test data added**
- [ ] **Frontend running on :5173**
- [ ] **Subject Browser working**
- [ ] **Material Viewer displays data**
- [ ] **Source attribution showing**
- [ ] **Search working**
- [ ] **Unit filtering working**
- [ ] **Spiders customized**
- [ ] **Scrapers run successfully**
- [ ] **Scheduler set up**

---

## 🆘 Troubleshooting

**Schema won't apply:**
- Check Supabase connection in `.env`
- Look for error messages in SQL Editor
- Make sure you have proper permissions

**APIs returning empty:**
- Schema not applied → Do Step 1
- No data yet → Add sample data or run scrapers

**Frontend can't connect:**
- Backend not running → Start with `python3 run_backend.py`
- CORS errors → Already configured in Flask

**Scrapers failing:**
- Selectors don't match → Inspect actual website HTML
- Connection refused → Check robots.txt, use delays
- No output → Add logging/print statements

---

## 🎯 Next Action: Apply Schema!

**Right now, DO THIS:**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Copy `backend/db/comprehensive_study_material_schema.sql`
4. Run it
5. Run `python3 verify_material_schema.py`
6. Come back when you see ✅ success!

Then we can proceed to testing the APIs and frontend!
