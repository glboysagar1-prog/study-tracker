# 🌐 VERCEL DEPLOYMENT GUIDE - Frontend

## Prerequisites
You need the URLs from Render:
- Backend URL: `https://gtu-backend-api.onrender.com`
- AI Agent URL: `https://gtu-ai-agent.onrender.com`

---

## Step-by-Step Instructions

### 1. Go to Vercel
Navigate to: **https://vercel.com/new**

### 2. Import Repository
- Click **"Add New..."** → **"Project"**
- Or click **"Import Git Repository"**
- Find: **`glboysagar1-prog/gtu-exam-prep`**
- Click **"Import"**

### 3. Configure Project Settings

```
┌─────────────────────────────────────────────────┐
│ Framework Preset: Vite                          │
│   (should auto-detect)                          │
├─────────────────────────────────────────────────┤
│ Root Directory: frontend                        │
│   (click "Edit" and type: frontend)             │
├─────────────────────────────────────────────────┤
│ Build Command: npm run build                    │
│   (auto-detected)                               │
├─────────────────────────────────────────────────┤
│ Output Directory: dist                          │
│   (auto-detected)                               │
├─────────────────────────────────────────────────┤
│ Install Command: npm install                    │
│   (auto-detected)                               │
└─────────────────────────────────────────────────┘
```

**CRITICAL**: Set **Root Directory** to `frontend`

### 4. Add Environment Variables

Click **"Environment Variables"** section and add:

```
┌──────────────────┬───────────────────────────────────────┐
│ Key              │ Value                                 │
├──────────────────┼───────────────────────────────────────┤
│ VITE_API_URL     │ https://gtu-backend-api.onrender.com  │
├──────────────────┼───────────────────────────────────────┤
│ VITE_AGENT_URL   │ https://gtu-ai-agent.onrender.com     │
└──────────────────┴───────────────────────────────────────┘
```

**USE YOUR ACTUAL RENDER URLS** (from previous steps)

### 5. Deploy
- Click **"Deploy"**
- Wait for build (2-5 minutes)
- Watch the build logs

### 6. Copy Your Production URL
Once deployed, Vercel will show:
```
https://gtu-exam-prep.vercel.app
```
(or similar with random subdomain)

**COPY THIS URL** - you need it for CORS configuration!

### 7. Test Your Frontend
- Click on the production URL
- Navigate to "Subjects"
- Click on "Data Structures"
- Try "View Flashcards"

---

## 🔧 Post-Deployment: Update Backend CORS

Your frontend is live, but backend needs to allow it!

### Update backend/app.py

1. **Edit locally**:
   ```python
   # In backend/app.py, line ~18
   allowed_origins = [
       "https://gtu-exam-prep.vercel.app",  # Your actual URL
       "https://*.vercel.app",
   ]
   ```

2. **Commit and push**:
   ```bash
   git add backend/app.py
   git commit -m "Update CORS for production Vercel URL"
   git push
   ```

3. **Render will auto-deploy** the update (wait 2-3 minutes)

---

## ✅ Final Verification

Test these in your browser:
- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] Subjects page displays
- [ ] Clicking "Data Structures" loads syllabus
- [ ] "View Flashcards" button works
- [ ] Flashcards flip when clicked
- [ ] "Chat with AI Tutor" opens chat
- [ ] No CORS errors in browser console (F12 → Console)

---

## 🎉 Deployment Complete!

Your GTU Exam Prep app is now LIVE at:
**https://your-app.vercel.app**

Share it with your classmates! 🚀
