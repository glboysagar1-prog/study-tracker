#!/bin/bash

echo "🚀 GTU Exam Prep - GitHub & Deployment Setup"
echo "=============================================="
echo ""

# Check if git remote exists
if git remote | grep -q "origin"; then
    echo "✅ Git remote 'origin' already exists:"
    git remote -v
    echo ""
    echo "To update remote URL:"
    echo "git remote set-url origin YOUR_NEW_REPO_URL"
else
    echo "📝 Git remote 'origin' not found."
    echo ""
    echo "STEP 1: Create GitHub Repository"
    echo "---------------------------------"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: gtu-exam-prep (or your choice)"
    echo "3. Description: GTU Exam Preparation App with AI-powered flashcards and chat"
    echo "4. Choose: Public or Private"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "STEP 2: Copy Your Repository URL"
    echo "After creating, GitHub will show you commands. You need the HTTPS URL:"
    echo "Example: https://github.com/YOUR_USERNAME/gtu-exam-prep.git"
    echo ""
    read -p "Enter your GitHub repository URL: " REPO_URL
    
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        echo "✅ Remote added successfully!"
        git remote -v
    else
        echo "❌ No URL provided. Please run this script again."
        exit 1
    fi
fi

echo ""
echo "STEP 3: Push to GitHub"
echo "----------------------"
read -p "Ready to push? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Code pushed to GitHub!"
        echo ""
        echo "=============================================="
        echo "NEXT STEPS: Deploy to Render & Vercel"
        echo "=============================================="
        echo ""
        echo "📦 BACKEND DEPLOYMENT (Render)"
        echo "------------------------------"
        echo "1. Go to: https://render.com/dashboard"
        echo "2. Click 'New +' → 'Web Service'"
        echo "3. Connect your GitHub account and repository"
        echo "4. Service name: gtu-backend-api"
        echo "5. Build Command: pip install -r requirements.txt"
        echo "6. Start Command: gunicorn -w 4 -b 0.0.0.0:\$PORT backend.app:app"
        echo "7. Add Environment Variables:"
        echo "   - FLASK_ENV=production"
        echo "   - SUPABASE_URL=your_supabase_url"
        echo "   - SUPABASE_KEY=your_supabase_key"
        echo "8. Click 'Create Web Service'"
        echo "9. Copy the service URL (e.g., https://gtu-backend-api.onrender.com)"
        echo ""
        echo "🤖 AI AGENT DEPLOYMENT (Render)"
        echo "-------------------------------"
        echo "1. Click 'New +' → 'Web Service' again"
        echo "2. Connect same repository"
        echo "3. Service name: gtu-ai-agent"
        echo "4. Build Command: pip install -r requirements.txt"
        echo "5. Start Command: uvicorn agent:app --host 0.0.0.0 --port \$PORT"
        echo "6. Add Environment Variables:"
        echo "   - BYTEZ_API_KEY=your_bytez_key"
        echo "   - SUPABASE_URL=your_supabase_url"
        echo "   - SUPABASE_KEY=your_supabase_key"
        echo "7. Click 'Create Web Service'"
        echo "8. Copy the service URL (e.g., https://gtu-ai-agent.onrender.com)"
        echo ""
        echo "🌐 FRONTEND DEPLOYMENT (Vercel)"
        echo "-------------------------------"
        echo "1. Go to: https://vercel.com/new"
        echo "2. Import your GitHub repository"
        echo "3. Framework Preset: Vite"
        echo "4. Root Directory: frontend"
        echo "5. Build Command: npm run build"
        echo "6. Output Directory: dist"
        echo "7. Add Environment Variables:"
        echo "   - VITE_API_URL=https://gtu-backend-api.onrender.com"
        echo "   - VITE_AGENT_URL=https://gtu-ai-agent.onrender.com"
        echo "   (Use your actual Render URLs from steps above)"
        echo "8. Click 'Deploy'"
        echo ""
        echo "📄 Detailed instructions: See DEPLOYMENT_WORKFLOW.md"
        echo ""
    else
        echo "❌ Push failed. Check your credentials and try again."
        echo "You may need to authenticate with GitHub."
    fi
else
    echo "Cancelled. Run 'git push -u origin main' when ready."
fi
