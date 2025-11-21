# 🎯 Data Insertion & Spider Customization - Complete Guide

## ✅ What's Been Done

### 1. Fixed Data Insertion Script ✅
**File:** `insert_study_materials.py`

**Status:**
- ✅ Important Questions: **6 added successfully**
- ❌ Notes: Failed due to RLS policy
- ❌ References: Failed due to RLS policy

**Total in database:**
- 49 important questions (6 new + 43 existing)
- 0 notes
- 0 references

### 2. Created RLS Policy Fix ✅
**File:** `backend/db/fix_rls_policies.sql`

This SQL script adds INSERT and UPDATE policies for:
- `notes` table
- `reference_materials` table  
- `syllabus_content` table
- `material_sources` table

### 3. Customized GTUStudy Spider ✅
**File:** `scraper/gtu_scraper/spiders/gtustudy_real_spider.py`

**Based on actual website structure:**
- Target URLs:
  - Materials: `https://gtustudy.com/gtu-study-material-all-branches/`
  - Exam Important: `https://gtustudy.com/exam-imp-gtu-all-branches-exam-imp/`
  - Papers: `https://gtustudy.com/gtu-paper-free-download/`

- Supports all branches:
  - Computer Engineering
  - Information Technology
  - Electronics & Communication
  - Electrical, Mechanical, Civil, Chemical
  - ICT, EI, Power Electronics, IC

**Features:**
- Extracts subject codes (7-digit format)
- Identifies units from text
- Handles Google Drive, PDF, and Telegram links
- Proper source attribution
- Duplicate detection via content hashing

---

## 🔧 STEPS TO FIX & TEST

### STEP 1: Apply RLS Policy Fix (REQUIRED)

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `backend/db/fix_rls_policies.sql`
3. Paste and Run

**OR via CLI:**
```bash
psql '<your-connection-string>' < backend/db/fix_rls_policies.sql
```

### STEP 2: Re-run Data Insertion

```bash
cd /Users/sagar/Documents/gtu
python3 insert_study_materials.py
```

**Expected output:**
```
📝 Inserting Notes...
  ✓ Added: Introduction to DBMS - Complete Notes...
  ✓ Added: ER Model and Relational Model Notes...
  ... 5 total notes added

📚 Inserting Reference Materials...
  ✓ Added: Database System Concepts (7th Edition)
  ... 3 total references added
```

### STEP 3: Verify Data

```bash
# Test notes API
curl http://localhost:5004/api/notes/3140703 | python3 -m json.tool

# Test search
curl 'http://localhost:5004/api/materials/search?q=normalization' | python3 -m json.tool

# Test references
curl http://localhost:5004/api/reference-materials/3140703 | python3 -m json.tool
```

### STEP 4: Test Customized Spider

```bash
cd /Users/sagar/Documents/gtu/scraper/gtu_scraper

# Test the real GTUStudy spider
scrapy crawl gtustudy_real -o test_gtustudy_real.json -s CLOSESPIDER_PAGECOUNT=10
```

**What it will do:**
1. Visit GTUStudy material pages
2. Extract links for each engineering branch
3. Parse study material download links
4. Extract subject codes and units
5. Create items for notes, papers, and questions
6. Save to Supabase (if pipeline enabled)

**Check output:**
```bash
# View scraped data
cat test_gtustudy_real.json | python3 -m json.tool | head -100

# Check what was added to database
python3 -c "from supabase import create_client; import os; from dotenv import load_dotenv; load_dotenv(); s = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY')); print(f'Notes: {len(s.table(\"notes\").select(\"*\").execute().data)}')"
```

---

## 📊 Spider Configuration

### Enable Pipeline in settings.py

Edit `scraper/gtu_scraper/settings.py`:

```python
ITEM_PIPELINES = {
    'gtu_scraper.supabase_pipeline.SupabasePipeline': 300,
}
```

### Run with Pipeline Enabled

```bash
scrapy crawl gtustudy_real
```

This will:
- Scrape GTUStudy pages
- Extract materials automatically
- Insert directly into Supabase
- Skip duplicates via content hash

---

## 🎯 Current System Status

| Component | Status | Count/Details |
|-----------|--------|---------------|
| Database Schema | ✅ Applied | All 6 tables created |
| RLS Policies (Read) | ✅ Working | Public SELECT allowed |
| RLS Policies (Insert) | ⚠️ **Need fix** | Apply fix_rls_policies.sql |
| Important Questions | ✅ Added | 49 total (6 new) |
| Notes | ❌ RLS blocked | 0 (will work after fix) |
| References | ❌ RLS blocked | 0 (will work after fix) |
| Backend APIs | ✅ Running | Port 5004 |
| GTUStudy Spider | ✅ Customized | Real URLs, all branches |
| GTUMaterial Spider | ⏳ Template | Needs customization |

---

## 🚀 Immediate Actions

**DO THIS NOW:**

1. **Apply RLS fix** in Supabase SQL Editor
2. **Run insert script** again: `python3 insert_study_materials.py`
3. **Verify APIs** return data:
   ```bash
   curl http://localhost:5004/api/notes/3140703
   ```

**THEN TEST SPIDER:**

4. **Test scraper**: `scrapy crawl gtustudy_real -o test.json`
5. **Enable pipeline** and run full scrape
6. **Set up scheduler** for automated updates

---

## 📝 Files Created/Modified

**New Files:**
- `insert_study_materials.py` - Fixed data insertion
- `backend/db/fix_rls_policies.sql` - RLS policy fix
- `scraper/gtu_scraper/spiders/gtustudy_real_spider.py` - Customized spider

**Ready to Use:**
- Backend running on `:5004`
- 6 new important questions added
- Spider ready to scrape real data
- Just need to apply RLS fix!

---

## ✨ After RLS Fix Applied

You'll have:
- ✅ 5+ notes for DBMS
- ✅ 6+ important questions  
- ✅ 3+ reference materials
- ✅ Working search and filtering
- ✅ Source attribution on everything
- ✅ Working spider for continuous updates

**The system will be fully operational!** 🎉
