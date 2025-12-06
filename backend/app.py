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
    
    @app.post("/api/agent/predict-paper")
    def predict_paper_endpoint():
        """Predict semester paper using AI"""
        from flask import request
        data = request.get_json()
        subject_id = data.get("subject_id")
        if not subject_id:
            return {"error": "subject_id is required"}, 400
        
        # Import and use the agent from agent_service
        from backend.agent_service import agent
        result = agent.predict_semester_paper(subject_id)
        return {"predicted_paper": result}

    @app.post("/api/agent/generate-answer")
    def generate_answer_endpoint():
        """Generate GTU answer for a question"""
        from flask import request
        data = request.get_json()
        question = data.get("question")
        subject_id = data.get("subject_id")
        if not question:
            return {"error": "question is required"}, 400
        
        # Import and use the agent from agent_service
        from backend.agent_service import agent
        result = agent.generate_gtu_answer(question, subject_id)
        return {"result": result}

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
    app.run(debug=True, port=5001)