# GTU Exam Prep - Step-by-Step Deployment Guide

## Prerequisites

Before you begin, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Render account (sign up at https://render.com)
- [ ] Supabase credentials ready (SUPABASE_URL, SUPABASE_KEY)
- [ ] Bytez API key ready (BYTEZ_API_KEY)

---

## Step 1: Push to GitHub

```bash
cd /Users/sagar/Documents/gtu

# Initialize git if not already done
git init

# Add .gitignore if not present
echo ".env
node_modules/
dist/
__pycache__/
*.pyc
.DS_Store
*.log
tmp/" > .gitignore

# Add all files
git add .
git commit -m "Initial commit - GTU Exam Prep App"

# Create GitHub repository and push
# (Follow GitHub instructions to create new repo)
git remote add origin https://github.com/YOUR_USERNAME/gtu-exam-prep.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend API to Render

### 2.1 Create New Web Service
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `gtu-backend-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn -w 4 -b 0.0.0.0:$PORT backend.app:app`
   - **Plan**: Free

### 2.2 Add Environment Variables
In Render dashboard, add these environment variables:
```
FLASK_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 2.3 Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy the service URL (e.g., `https://gtu-backend-api.onrender.com`)

---

## Step 3: Deploy AI Agent Service to Render

### 3.1 Create Second Web Service
1. Click "New +" → "Web Service"
2. Connect same GitHub repository
3. Configure service:
   - **Name**: `gtu-ai-agent`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn agent:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### 3.2 Add Environment Variables
```
BYTEZ_API_KEY=your_bytez_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 3.3 Deploy
- Click "Create Web Service"
- Copy the service URL (e.g., `https://gtu-ai-agent.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 4.2 Deploy via Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4.3 Add Environment Variables
In Vercel project settings → Environment Variables:
```
VITE_API_URL=https://gtu-backend-api.onrender.com
VITE_AGENT_URL=https://gtu-ai-agent.onrender.com
```

### 4.4 Update vercel.json
Update `/Users/sagar/Documents/gtu/frontend/vercel.json` with your actual Render URLs:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR-BACKEND-URL.onrender.com/api/$1"
    },
    {
      "source": "/agent/(.*)",
      "destination": "https://YOUR-AGENT-URL.onrender.com/$1"
    }
  ]
}
```

### 4.5 Deploy
- Click "Deploy"
- Wait for build (2-3 minutes)
- Copy the production URL (e.g., `https://gtu-exam-prep.vercel.app`)

---

## Step 5: Update Backend CORS

### 5.1 Update Allowed Origins
Edit `/Users/sagar/Documents/gtu/backend/app.py`:
```python
allowed_origins = [
    "https://gtu-exam-prep.vercel.app",  # Your actual Vercel URL
    "https://*.vercel.app",
]
```

### 5.2 Commit and Push
```bash
git add backend/app.py
git commit -m "Update CORS for production"
git push
```

This will automatically trigger a redeploy on Render.

---

## Step 6: Verify Deployment

### 6.1 Test Backend API
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/subjects
```

Expected: JSON response with subjects list

### 6.2 Test AI Agent
```bash
curl https://YOUR-AGENT-URL.onrender.com/health
```

Expected: Health check response

### 6.3 Test Frontend
1. Open `https://YOUR-APP.vercel.app` in browser
2. Navigate to Subjects page
3. Click on a subject
4. Test flashcards feature
5. Test AI chat feature

---

## Step 7: Monitor & Troubleshoot

### Check Logs

**Render Logs**:
- Go to each service dashboard
- Click "Logs" tab
- Monitor for errors

**Vercel Logs**:
- Go to deployment page
- Click "Deployment Logs"
- Check build and runtime logs

### Common Issues

#### 1. Backend 500 Error
- Check Render logs for Python errors
- Verify environment variables are set correctly
- Ensure Supabase credentials are valid

#### 2. Frontend API Errors
- Verify VITE_API_URL is correct
- Check CORS configuration in backend
- Ensure backend service is running

#### 3. AI Chat Not Working
- Verify BYTEZ_API_KEY is valid
- Check AI agent service is running
- Ensure frontend has correct VITE_AGENT_URL

---

## Step 8: Performance Optimization (Optional)

### Render (Free Tier Limitations)
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading to paid plan ($7/month) for 24/7 uptime

### Solutions:
1. **Cron Job Keep-Alive**: Use cron-job.org to ping your backend every 10 minutes
2. **Upgrade to Paid Plan**: $7/month for each service
3. **Use Render Blueprints**: For Infrastructure as Code

---

## Step 9: Custom Domain (Optional)

### Add Custom Domain to Vercel
1. Go to Project Settings → Domains
2. Add your domain (e.g., `gtuexamprep.com`)
3. Update DNS records as shown
4. Wait for DNS propagation (up to 48 hours)

### Update Backend CORS
Add your custom domain to allowed origins:
```python
allowed_origins = [
    "https://gtuexamprep.com",
    "https://www.gtuexamprep.com"
]
```

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] AI Agent deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured on all platforms
- [ ] CORS updated with production URLs
- [ ] All services tested and working
- [ ] Error monitoring set up
- [ ] Custom domain configured (optional)

---

## Useful Commands

```bash
# View backend logs (if you have render-cli)
render logs gtu-backend-api

# Redeploy frontend
cd frontend && vercel --prod

# Test production API locally
curl -H "Origin: https://your-app.vercel.app" \
  https://your-backend.onrender.com/api/subjects

# Build frontend locally to test
cd frontend && npm run build && npm run preview
```

---

## Next Steps After Deployment

1. **Monitor Usage**: Check Render and Vercel dashboards for traffic
2. **Set up Analytics**: Add Google Analytics or Vercel Analytics
3. **Error Tracking**: Consider Sentry for error monitoring
4. **Performance**: Use Lighthouse to optimize performance
5. **SEO**: Add meta tags and sitemap
6. **Security**: Enable HTTPS (automatic on Vercel/Render)
7. **Backups**: Regular database backups via Supabase

---

## Cost Breakdown (Current Setup)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Vercel | Unlimited personal projects | Frontend hosting | **$0** |
| Render | 750 hrs/month per service | Backend + AI Agent | **$0** (or $14/mo for 24/7) |
| Supabase | 500MB DB, 2GB bandwidth | Database | **$0** (enough for testing) |
| **Total** | | | **$0 - $14/month** |

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **GTU App Issues**: Check application logs

---

**Congratulations!** 🎉 Your GTU Exam Prep app is now live!
