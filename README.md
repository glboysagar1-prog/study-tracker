# GTU Exam Preparation Web Application

A full-stack web application that helps GTU (Gujarat Technological University) students prepare for semester exams by providing real-time syllabus updates, AI-powered study tools, previous year papers, and personalized learning features.

## Features

### GTU-Specific Features
- **Syllabus Management**: Organized by Course → Branch → Semester → Subject with real-time updates from GTU website
- **GTU Exam Pattern Replication**: Mock tests matching GTU format (14 questions × 1 mark, 3-mark, 4-mark, 7-mark questions)
- **Previous Year Papers**: Complete archive organized by subject and year
- **Important Questions Database**: High-probability questions categorized by marks

### AI-Powered Study Tools
- **Smart Question Generation**: Unlimited practice questions from syllabus topics
- **PDF to Study Material Converter**: Auto-generate flashcards and summaries
- **Personalized Learning**: Adaptive quizzes and study plans based on performance
- **AI Study Assistant**: Chatbot for subject-specific questions
- **Voice-Based AI Tutor**: Interactive Q&A sessions using voice input

### Practice and Assessment
- **Mock Test System**: Full-length exams with timer and auto-submit
- **Performance Analytics**: Detailed reports with topic-wise analysis
- **Answer Evaluation**: Auto-grading and AI hints for descriptive answers

## Technology Stack

### Frontend
- React.js/Next.js for responsive web interface
- Tailwind CSS for styling
- Mobile-responsive design

### Backend
- Python with Supabase integration
- RESTful APIs
- JWT authentication

### Database
- Supabase for all data storage and authentication
- Supabase Storage for PDF files and other assets

### Web Scraping
- Scrapy for automated GTU website scraping
- Supabase integration for data storage
- Cron jobs for automated scheduling

### AI/ML Integration
- OpenAI API or Google Gemini
- Question generation and personalization
- AI chatbot for doubt solving
- Whisper Large V3 for voice recognition (via Bytez)
- Text-to-speech for audio responses

## Project Structure

```
gtu/
├── backend/                 # Supabase backend application
│   ├── api/                 # API routes
│   ├── auth/                # Authentication routes
│   ├── supabase_client.py   # Supabase client
│   ├── supabase_auth.py     # Supabase authentication
│   ├── models.py            # Data models
│   ├── config.py            # Configuration
│   └── app.py               # App factory
├── scraper/                 # Scrapy web scraper
│   └── gtu_scraper/         # Scrapy project
│       ├── spiders/         # GTU scraping spiders
│       ├── items.py         # Data models
│       ├── pipelines.py     # Data processing pipelines
│       └── settings.py      # Scrapy settings
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Supabase account
- Node.js 16+

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd gtu
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Set up Supabase:
   - Create a Supabase account at https://supabase.io
   - Create a new project
   - Update Supabase credentials in [.env](file:///Users/sagar/Documents/gtu/.env.example) file
   - Create required tables using the schema in [backend/supabase_init.py](file:///Users/sagar/Documents/gtu/backend/supabase_init.py)

5. Create a [.env](file:///Users/sagar/Documents/gtu/.env.example) file based on [.env.example](file:///Users/sagar/Documents/gtu/.env.example):
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration
   ```

### Running the Application

1. Start the backend server:
   ```bash
   python run_backend.py
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Run the scraper manually:
   ```bash
   cd scraper/gtu_scraper
   scrapy crawl gtu_syllabus
   ```

4. Set up automated scraping:
   - Using cron (Linux/Mac):
     ```bash
     crontab -e
     # Add this line to run daily at 3 AM:
     0 3 * * * /path/to/scraper/run_scraper.sh
     ```
   - Using the Python scheduler:
     ```bash
     python scraper/scheduler.py
     ```

### API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get user profile (requires authentication)

### Subjects and Content
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/<subject_id>/syllabus` - Get syllabus for a subject
- `GET /api/subjects/<subject_id>/questions` - Get questions for a subject
- `GET /api/subjects/<subject_id>/papers` - Get previous papers for a subject

### Mock Tests
- `GET /api/mock-tests` - Get all mock tests

### Voice Assistant
- `POST /api/voice/transcribe` - Transcribe voice to text
- `POST /api/voice/question` - Ask a question via voice
- `POST /api/voice/tts` - Convert text to speech

### AI Assistant
- `POST /api/ai-assistant` - Get AI-generated responses using GPT-4o

## Deployment

### Backend
- Deploy to AWS EC2, Google Cloud Run, or Heroku
- Use Gunicorn as WSGI server for production

### Scraper
- Run as cron jobs on server or AWS Lambda
- Monitor logs at `/var/log/gtu_scraper.log`

### Database
- Use Supabase cloud database

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License
This project is licensed under the MIT License.