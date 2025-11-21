#!/bin/bash
# Quick fix script for GTU App API connection

echo "🔧 Applying GTU App Quick Fix"
echo "=============================="

# Create API config file
echo "Creating API configuration..."
cat > frontend/src/config/api.js << 'EOF'
export const API_BASE_URL = 'http://localhost:5000';
EOF

echo "✅ API config created"

echo ""
echo "📋 Next Steps (MANUAL):"
echo "1. Stop the frontend server (Ctrl+C in the terminal running npm)"
echo "2. Restart it: cd frontend && npm run dev"
echo "3. Open http://localhost:3001/subjects in browser"
echo "4. You should now see 8 subjects!"
echo ""
echo "✨ Fix complete. Just restart the frontend!"
