from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS to allow all origins for API and auth routes
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/auth/*": {"origins": "*"}
    })
    
    # Load configuration
    from .config import Config
    app.config.from_object(Config)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)
    
    # Import voice API to register routes
    from backend import voice_api
    
    # Register blueprints
    from backend.api import api_bp
    from backend.auth import auth_bp
    
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    # PDF serving endpoint for local development
    @app.route('/api/pdf/<path:filename>')
    def serve_pdf(filename):
        """Serve PDF files from /tmp/gtu_pdfs/ directory"""
        from flask import send_file
        import os
        try:
            # Check /tmp/gtu_pdfs/ first
            pdf_path = f"/tmp/gtu_pdfs/{filename}"
            if os.path.exists(pdf_path):
                return send_file(pdf_path, mimetype='application/pdf')
            
            # Check data/pyqs_sem3/
            # We need to handle the case where filename might be just the name or relative path
            # The files are flat in data/pyqs_sem3
            project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            pdf_path = os.path.join(project_root, "data", "pyqs_sem3", filename)
            if os.path.exists(pdf_path):
                return send_file(pdf_path, mimetype='application/pdf')

            # Fallback to /tmp/ for backward compatibility
            pdf_path = f"/tmp/{filename}"
            if os.path.exists(pdf_path):
                return send_file(pdf_path, mimetype='application/pdf')
            else:
                return {"error": "PDF not found"}, 404
        except Exception as e:
            return {"error": str(e)}, 500
    
    @app.route('/')
    def hello():
        return {'message': 'GTU Exam Preparation API'}
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5001)