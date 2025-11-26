from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Determine allowed origins based on environment
    flask_env = os.getenv('FLASK_ENV', 'development')
    print(f"DEBUG: FLASK_ENV is {flask_env}")
    
    if flask_env == 'production':
        # Production origins - Update these with your actual deployment URLs
        allowed_origins = [
            "https://gtu-exam-prep.vercel.app",  # Update with your Vercel domain
            "https://*.vercel.app",  # Allow all Vercel preview deployments
        ]
    else:
        # Development origins
        allowed_origins = [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001", 
            "http://127.0.0.1:3002"
        ]
    
    # Configure CORS
    if flask_env == 'production':
        CORS(app, resources={
            r"/api/*": {"origins": allowed_origins},
            r"/auth/*": {"origins": allowed_origins}
        })
    else:
        # Allow all origins in development
        print(f"DEBUG: Starting in {flask_env} mode with CORS allowing all origins")
        CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    
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
    app.run(debug=True)