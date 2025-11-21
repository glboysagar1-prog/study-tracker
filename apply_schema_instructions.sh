#!/bin/bash

# Quick Apply Schema Script
# This scipt helps you apply the material aggregation schema to Supabase

echo "============================================================"
echo "Material Aggregation Schema - Quick Apply"
echo "============================================================"
echo ""
echo "The schema file is ready at:"
echo "  backend/db/comprehensive_study_material_schema.sql"
echo ""
echo "OPTION 1: Via Supabase Dashboard (Recommended)"
echo "------------------------------------------------------------"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in left sidebar"
echo "4. Click 'New Query'"
echo "5. Copy contents of comprehensive_study_material_schema.sql"
echo "6. Paste and click 'Run'"
echo ""
echo "OPTION 2: Via Command Line (if you have psql)"
echo "------------------------------------------------------------"
echo "Get your Supabase connection string from:"
echo "  Project Settings > Database > Connection String (URI)"
echo ""
echo "Then run:"
echo "  psql '<your-connection-string>' < backend/db/comprehensive_study_material_schema.sql"
echo ""
echo "============================================================"
echo "After applying, verify with:"
echo "  python3 verify_material_schema.py"
echo "============================================================"
echo ""
echo "Opening schema file for you to copy..."
echo ""

# Try to open the file in default editor or show path
if command -v code &> /dev/null; then
    code backend/db/comprehensive_study_material_schema.sql
    echo "✓ Opened in VS Code"
elif command -v cat &> /dev/null; then
    echo "Schema file contents:"
    echo "============================================================"
    cat backend/db/comprehensive_study_material_schema.sql
fi
