import React from 'react'
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom'
import Sidebar from './components/Sidebar'
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
import Analytics from './components/Analytics';
import LabPrograms from './components/LabPrograms';
import VideoPlaylist from './components/VideoPlaylist';
import AllMockTests from './components/AllMockTests';
import AllSyllabus from './components/AllSyllabus';
import AllPreviousPapers from './components/AllPreviousPapers';
import AllImportantQuestions from './components/AllImportantQuestions';
import AllLabPrograms from './components/AllLabPrograms';
import AllVideoTutorials from './components/AllVideoTutorials';
import PrepareExam from './components/PrepareExam';
import RealTimeVoice from './components/RealTimeVoice';

// Wrapper component for MaterialViewer to extract subjectCode from URL
function MaterialViewerWrapper() {
  const { subjectCode } = useParams();
  return <MaterialViewer subjectCode={subjectCode} />;
}

// Layout wrapper for pages that need sidebar
function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes without sidebar */}
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with sidebar */}
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/subjects" element={<AppLayout><Subjects /></AppLayout>} />
        <Route path="/syllabus/:subjectId" element={<AppLayout><SubjectLibrary /></AppLayout>} />
        <Route path="/previous-papers/:subjectId" element={<AppLayout><PreviousPapers /></AppLayout>} />
        <Route path="/mock-tests/:subjectId" element={<AppLayout><MockTests /></AppLayout>} />
        <Route path="/mock-test/:testId" element={<AppLayout><MockTest /></AppLayout>} />
        <Route path="/important-questions/:subjectId" element={<AppLayout><ImportantQuestions /></AppLayout>} />
        <Route path="/voice-assistant" element={<AppLayout><VoiceAssistant /></AppLayout>} />
        <Route path="/ai-assistant" element={<AppLayout><AIStudyAssistant /></AppLayout>} />
        <Route path="/prepare-exam" element={<AppLayout><PrepareExam /></AppLayout>} />
        <Route path="/upload-material" element={<AppLayout><MaterialUploadForm /></AppLayout>} />
        <Route path="/browse" element={<AppLayout><SubjectBrowser /></AppLayout>} />
        <Route path="/materials/:subjectCode" element={<AppLayout><MaterialViewerWrapper /></AppLayout>} />
        <Route path="/realtime-voice" element={<AppLayout><RealTimeVoice /></AppLayout>} />

        {/* Resource Overview Routes */}
        <Route path="/all-mock-tests" element={<AppLayout><AllMockTests /></AppLayout>} />
        <Route path="/all-syllabus" element={<AppLayout><AllSyllabus /></AppLayout>} />
        <Route path="/all-previous-papers" element={<AppLayout><AllPreviousPapers /></AppLayout>} />
        <Route path="/all-important-questions" element={<AppLayout><AllImportantQuestions /></AppLayout>} />
        <Route path="/all-lab-programs" element={<AppLayout><AllLabPrograms /></AppLayout>} />
        <Route path="/all-video-tutorials" element={<AppLayout><AllVideoTutorials /></AppLayout>} />

        <Route path="/analytics" element={<AppLayout><Analytics /></AppLayout>} />
      </Routes>
      <ChatBot />
    </Router>
  )
}

export default App