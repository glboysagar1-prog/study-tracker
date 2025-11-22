# 🤖 RENDER DEPLOYMENT GUIDE - AI Agent

## Step-by-Step Instructions

### 1. Go to Render Dashboard
Navigate to: **https://render.com/dashboard**

### 2. Create SECOND Web Service
- Click **"New +"** button again
- Select **"Web Service"**

### 3. Connect Same Repository
- Select: **`glboysagar1-prog/gtu-exam-prep`** (same repo)
- Click **"Connect"**

### 4. Configure AI Agent Settings

Fill in EXACTLY as shown:

```
┌─────────────────────────────────────────────────┐
│ Name: gtu-ai-agent                              │
├─────────────────────────────────────────────────┤
│ Region: Oregon (same as backend)                │
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
│   uvicorn backend.agent_service:app --host 0.0.0.0 --port $PORT │
└─────────────────────────────────────────────────┘
```

**IMPORTANT**: Copy this EXACT start command:
```bash
uvicorn backend.agent_service:app --host 0.0.0.0 --port $PORT
```

### 5. Choose Plan
- Select: **Free**
- Click **"Advanced"** for environment variables

### 6. Add Environment Variables

Add these THREE variables:

```
┌──────────────────┬────────────────────────────────┐
│ Key              │ Value                          │
├──────────────────┼────────────────────────────────┤
│ BYTEZ_API_KEY    │ <your Bytez API key>           │
├──────────────────┼────────────────────────────────┤
│ SUPABASE_URL     │ <your Supabase URL>            │
├──────────────────┼────────────────────────────────┤
│ SUPABASE_KEY     │ <your Supabase key>            │
└──────────────────┴────────────────────────────────┘
```

**Get values from your `.env` file**

### 7. Create Web Service
- Click **"Create Web Service"**
- Wait for deployment (5-10 minutes)

### 8. Copy Your AI Agent URL
Once deployed:
```
https://gtu-ai-agent.onrender.com
```

**SAVE THIS URL** - you'll need it for frontend!

### 9. Test Your AI Agent (Optional)
```bash
curl https://gtu-ai-agent.onrender.com/health
```

---

## ✅ Checklist
- [ ] Created second web service
- [ ] Set name: `gtu-ai-agent`
- [ ] Set start command: `uvicorn backend.agent_service:app --host 0.0.0.0 --port $PORT`
- [ ] Added all 3 environment variables (including BYTEZ_API_KEY)
- [ ] Deployment successful
- [ ] Copied AI agent URL

---

**You should now have TWO URLs:**
1. Backend: `https://gtu-backend-api.onrender.com`
2. AI Agent: `https://gtu-ai-agent.onrender.com`

**Next: Deploy Frontend to Vercel**
