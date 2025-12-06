# GTU Multilingual AI - Quick Start Guide

Welcome to the enhanced GTU Exam Prep app with multilingual support powered by IndicLLM and SEAL-style self-improvement!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install MLX Dependencies

```bash
cd /Users/sagar/Documents/gtu

# Make setup script executable and run
chmod +x setup_mlx.sh
./setup_mlx.sh
```

This will:
- Create Python virtual environment
- Install MLX and dependencies
- Download IndicBART model (~2-3GB)
- Test M4 GPU inference
- Configure environment variables

**Expected output:** ✅ "MLX model loaded successfully on M4"

### Step 2: Apply Database Schema

```bash
# Connect to Supabase and run the schema
psql $SUPABASE_URL < supabase_multilingual_schema.sql
```

Or use Supabase dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase_multilingual_schema.sql`
3. Run the query

This creates 7 new tables for multilingual content and self-improvement.

###Step 3: Test MLX Service

```bash
# Activate MLX virtual environment
source venv_mlx/bin/activate

# Run test suite
python evaluation/test_mlx_service.py
```

Expected: 5/5 tests passing with M4 GPU active.

### Step 4: Update Backend

The new API endpoints are in `backend/api/multilingual.py`. To integrate:

**Option A: If using Flask (current setup):**
```python
# In backend/app.py, add:
from backend.api.multilingual import router as multilingual_router
app.include_router(multilingual_router)
```

**Option B: If switching to FastAPI (recommended):**
```bash
# The agent_service.py already uses FastAPI
# Just update your run command:
uvicorn backend.agent_service:app --reload --port 5001
```

### Step 5: Update Frontend

Add language selector to your main components:

```jsx
// In frontend/src/components/Syllabus.jsx (or Dashboard.jsx)
import LanguageSelector from './LanguageSelector';
import FeedbackWidget from './FeedbackWidget';

// Add to your component:
<LanguageSelector 
  currentLanguage={language}
  onLanguageChange={handleLanguageChange}
/>

// At bottom of content:
<FeedbackWidget 
  contentId={syllabusId}
  contentVariantId="default"
  contentType="syllabus"
  languageCode={language}
/>
```

## 🧪 Testing the Features

### Test 1: Translation

```bash
# Start backend
cd backend
source ../venv_mlx/bin/activate
python -m uvicorn agent_service:app --reload --port 5001
```

Then test API:
```bash
curl -X POST "http://localhost:5001/api/multilingual/translate" \
  -H "Content-Type: application/json" \
  -d '{"text":"Operating System","target_language":"gu"}'
```

### Test 2: Language Selector (Frontend)

1. `cd frontend && npm run dev`
2. Navigate to any study material page
3. Click the language dropdown (top-right)
4. Select "ગુજરાતી (Gujarati)"
5. Content should translate in ~2 seconds

### Test 3: Feedback Widget

1. Scroll to bottom of any note
2. Click "Rate this content"
3. Give emoji reaction or detailed ratings
4. Check Supabase `user_feedback_detailed` table

### Test 4: Self-Improvement Experiment

```python
# In Python shell:
from backend.self_improvement import ExperimentManager
from backend.supabase_client import get_supabase_client

manager = ExperimentManager(get_supabase_client())
exp_id = manager.create_experiment(
    topic="Operating Systems",
    content_type="study_note"
)

print(f"Created experiment: {exp_id}")
```

## 📊 Features Overview

### Multilingual Support
- **22+ Indian Languages**: Gujarati, Hindi, Marathi, Tamil, Telugu, Bengali, and more
- **Local Inference**: Uses your M4 Mac GPU for fast, free translation
- **Smart Caching**: Repeat translations are instant
- **Hybrid Approach**: MLX for translation + GPT-4o for complex reasoning

### Self-Improvement (SEAL-Inspired)
- **Content Variants**: Generates multiple versions (detailed, concise, visual)
- **A/B Testing**: Automatically tests which version students prefer
- **Reward Learning**: Improves based on user ratings and engagement
- **Continuous Evolution**: Prompts get better over time

### User Experience
- **Beautiful Language Selector**: 12+ languages with flags
- **Smart Feedback Widget**: Emoji reactions + detailed ratings
- **Gamification**: Shows impact ("Your feedback helped 12 students!")
- **Auto-Translation**: Optional setting to translate all content

## 🎯 Next Steps

1. **Run Full Test Suite**:
   ```bash
   python evaluation/test_mlx_service.py
   ```

2. **Generate First Multilingual Content**:
   - Create a study note in English
   - It will auto-generate Gujarati/Hindi versions
   - Users can toggle between languages

3. **Monitor Self-Improvement**:
   - Check `content_experiments` table weekly
   - Review which content variants perform better
   - Apply improvements to your prompts

4. **Production Deployment**:
   - Decide: Run MLX on your Mac or deploy to cloud
   - Enable feature flags for gradual rollout
   - Monitor user feedback and translation quality

## 🔧 Configuration

Key environment variables (added by setup_mlx.sh):

```bash
# MLX Settings
MLX_MODEL_PATH=/Users/sagar/.models/gtu-indic/indicbart
MLX_USE_GPU=true
MLX_BATCH_SIZE=4

# Multilingual
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,gu,hi,mr,ta,te,bn,pa,kn,ml,or,as

# Self-Improvement
ENABLE_EXPERIMENTS=true
EXPERIMENT_SAMPLE_RATE=0.2  # 20% users see variant B
```

## 🐛 Troubleshooting

### MLX model not loading
```bash
# Check if model files exist:
ls -lh ~/.models/gtu-indic/indicbart/

# Re-run setup:
./setup_mlx.sh
```

### Translations failing
```bash
# Test MLX service directly:
python backend/mlx_service.py
```

### M4 GPU not being used
```bash
# Check MPS availability:
python -c "import torch; print(torch.backends.mps.is_available())"
```

## 📚 Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React)        │
│  - Lang Selector│
│  - Feedback     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend API   │
│   (FastAPI)     │
│  - /translate   │
│  - /feedback    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│  MLX   │ │ Bytez    │
│ (Local)│ │ (GPT-4o) │
│  M4 GPU│ │  Cloud   │
└────────┘ └──────────┘
         │
         ▼
   ┌──────────┐
   │ Supabase │
   │  Cache   │
   └──────────┘
```

## 🎉 Success Criteria

You'll know it's working when:
- ✅ `test_mlx_service.py` shows 5/5 tests passing
- ✅ Language selector appears in frontend
- ✅ Translations complete in < 2 seconds
- ✅ Gujarati text displays correctly (no boxes/gibberish)
- ✅ Feedback widget saves to database
- ✅ M4 GPU (MPS) is being used

## 🤝 Support

If you encounter issues:
1. Check `backend/backend.log` for errors
2. Run `python evaluation/test_mlx_service.py` for diagnostics
3. Verify environment variables in `.env`

Happy multilingual learning! 🌍📚
