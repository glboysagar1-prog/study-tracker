from backend.agent_service import app
import os

if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable for Render, default to 8000 for local development
    port = int(os.environ.get('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)