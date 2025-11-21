"""
Simple PDF server endpoint for local development
Add this to your Flask backend
"""
from flask import send_file
import os

@app.route('/api/pdf/<path:filename>')
def serve_pdf(filename):
    """Serve PDF files from /tmp/ directory"""
    try:
        pdf_path = f"/tmp/{filename}"
        if os.path.exists(pdf_path):
            return send_file(pdf_path, mimetype='application/pdf')
        else:
            return {"error": "PDF not found"}, 404
    except Exception as e:
        return {"error": str(e)}, 500
