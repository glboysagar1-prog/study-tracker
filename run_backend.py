#!/usr/bin/env python3
import os
import sys

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app

# Note: Supabase tables are created via the Supabase dashboard
# Run backend/supabase_init.py for setup information

def main():
    app = create_app()
    
    # Run the app
    app.run(host='0.0.0.0', port=5004, debug=True)

if __name__ == '__main__':
    main()