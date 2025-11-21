import React from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import Home from './components/Home'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Subjects from './components/Subjects'
import Syllabus from './components/Syllabus'
import MockTest from './components/MockTest'
import MockTests from './components/MockTests'
import PreviousPapers from './components/PreviousPapers'
import ImportantQuestions from './components/ImportantQuestions'
import VoiceAssistant from './components/VoiceAssistant'
import ChatBot from './components/ChatBot'
import SubjectLibrary from './components/SubjectLibrary';
import MaterialUploadForm from './components/MaterialUploadForm';
import AIStudyAssistant from './components/AIStudyAssistant';
import SubjectBrowser from './components/SubjectBrowser';
import MaterialViewer from './components/MaterialViewer';

// Wrapper component for MaterialViewer to extract subjectCode from URL
function MaterialViewerWrapper() {
  const { subjectCode } = useParams();
  return <MaterialViewer subjectCode={subjectCode} />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 relative">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/syllabus/:subjectId" element={<SubjectLibrary />} />
          <Route path="/previous-papers/:subjectId" element={<PreviousPapers />} />
          <Route path="/mock-tests/:subjectId" element={<MockTests />} />
          <Route path="/mock-test/:testId" element={<MockTest />} />
          <Route path="/important-questions/:subjectId" element={<ImportantQuestions />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
          <Route path="/ai-assistant" element={<AIStudyAssistant />} />
          <Route path="/upload-material" element={<MaterialUploadForm />} />
          {/* New Material Aggregation Routes */}
          <Route path="/browse" element={<SubjectBrowser />} />
          <Route path="/materials/:subjectCode" element={<MaterialViewerWrapper />} />
        </Routes>
        <ChatBot />
      </div>
    </Router>
  )
}

export default App