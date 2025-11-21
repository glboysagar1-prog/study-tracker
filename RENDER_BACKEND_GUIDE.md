# 🚀 RENDER DEPLOYMENT GUIDE - Backend API

## Step-by-Step Instructions

### 1. Go to Render Dashboard
Navigate to: **https://render.com/dashboard**

### 2. Create New Web Service
- Click the **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect Repository
- Click **"Connect a repository"** or **"Configure account"** if needed
- Find and select: **`glboysagar1-prog/gtu-exam-prep`**
- Click **"Connect"**

### 4. Configure Service Settings

Fill in EXACTLY as shown:

```
┌─────────────────────────────────────────────────┐
│ Name: gtu-backend-api                           │
├─────────────────────────────────────────────────┤
│ Region: Oregon (or closest to you)              │
├─────────────────────────────────────────────────┤
│ Branch: main                                     │
├─────────────────────────────────────────────────┤
│ Root Directory: (leave blank)                   │
├─────────────────────────────────────────────────┤
│ Environment: Python 3                           │
├─────────────────────────────────────────────────┤
│ Build Command:                                  │
│   pip install -r requirements.txt               │
├─────────────────────────────────────────────────┤
│ Start Command:                                  │
│   gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app│
└─────────────────────────────────────────────────┘
```

**IMPORTANT**: Copy this EXACT start command:
```bash
gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app
```

### 5. Choose Plan
- Select: **Free** (scroll down to find it)
- Click **"Advanced"** to expand environment variables section

### 6. Add Environment Variables

Click **"Add Environment Variable"** three times and add:

```
┌──────────────────┬────────────────────────────────┐
│ Key              │ Value                          │
├──────────────────┼────────────────────────────────┤
│ FLASK_ENV        │ production                     │
├──────────────────┼────────────────────────────────┤
│ SUPABASE_URL     │ <your actual Supabase URL>     │
├──────────────────┼────────────────────────────────┤
│ SUPABASE_KEY     │ <your actual Supabase key>     │
└──────────────────┴────────────────────────────────┘
```

**To find your Supabase credentials:**
- Open your `.env` file
- Copy `SUPABASE_URL` and `SUPABASE_KEY` values

### 7. Create Web Service
- Scroll to bottom
- Click **"Create Web Service"**
- Wait for deployment (5-10 minutes)

### 8. Copy Your Backend URL
Once deployed, you'll see:
```
https://gtu-backend-api.onrender.com
```

**SAVE THIS URL** - you'll need it for frontend deployment!

### 9. Test Your Backend
Open a new terminal and test:
```bash
curl https://gtu-backend-api.onrender.com/api/subjects
```

Expected: JSON response with subjects

---

## ✅ Checklist
- [ ] Created web service
- [ ] Set name: `gtu-backend-api`
- [ ] Set start command: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app`
- [ ] Added all 3 environment variables
- [ ] Deployment successful (green status)
- [ ] Copied backend URL
- [ ] Tested API endpoint

---

**Next: Deploy AI Agent** (follow similar steps with different start command)
