#!/bin/bash
# Complete Setup and Testing Workflow for GTU App

echo "🚀 GTU App Complete Setup & Data Population"
echo "=============================================="

# Step 1: Check if backend is running
echo ""
echo "📡 Step 1: Checking Backend Status..."
BACKEND_STATUS=$(curl -s http://127.0.0.1:5000/api/health 2>/dev/null)
if [ -z "$BACKEND_STATUS" ]; then
    echo "❌ Backend is not reachable. Please start it with:"
    echo "   cd backend && python3 -m backend.app"
    exit 1
else
    echo "✅ Backend is running"
fi

# Step 2: Seed complete data
echo ""
echo "📦 Step 2: Seeding Database with Complete Data..."
python3 seed_complete_data.py

# Step 3: Verify subjects were inserted
echo ""
echo "✅ Step 3: Verifying Data..."
SUBJECTS_COUNT=$(curl -s http://127.0.0.1:5000/api/subjects | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('subjects', [])))" 2>/dev/null)
echo "📚 Subjects in database: $SUBJECTS_COUNT"

# Step 4: Test important endpoints
echo ""
echo "🔍 Step 4: Testing Key Endpoints..."
echo "  - /api/subjects"
curl -s http://127.0.0.1:5000/api/subjects | python3 -m json.tool | head -20

echo ""
echo "  - /api/subjects/metadata"
curl -s http://127.0.0.1:5000/api/subjects/metadata | python3 -m json.tool

echo ""
echo "✨ Setup Complete!"
echo ""
echo "📱 Next Steps:"
echo "1. Open http://localhost:3001/subjects in your browser"
echo "2. You should see $SUBJECTS_COUNT subjects listed"
echo "3. Click on any subject to view study materials"
echo "4. Test the AI Chatbot at http://localhost:3001/ai-assistant"
