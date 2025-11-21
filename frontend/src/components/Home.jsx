import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">GTU Exam Preparation</h1>
        <p className="text-xl text-gray-600 mb-8">Prepare effectively for your GTU semester exams</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Syllabus</h2>
            <p className="text-gray-600 mb-4">Get updated syllabus for all subjects</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              View Subjects →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Previous Papers</h2>
            <p className="text-gray-600 mb-4">Practice with past exam papers</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              View Papers →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-3">Mock Tests</h2>
            <p className="text-gray-600 mb-4">Take practice tests in GTU format</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              Start Test →
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-semibold mb-3">Voice-Based AI Tutor</h2>
          <p className="text-gray-600 mb-4">Ask questions verbally and get instant AI-powered explanations</p>
          <Link to="/voice-assistant" className="text-blue-500 hover:text-blue-700 font-medium">
            Try Voice Assistant →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-3">AI Study Assistant</h2>
          <p className="text-gray-600 mb-4">Get detailed explanations for GTU subjects with GPT-4o</p>
          <Link to="/ai-assistant" className="text-blue-500 hover:text-blue-700 font-medium">
            Try AI Assistant →
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">AI-Powered Learning</h2>
          <p className="text-gray-600 mb-4">
            Our AI assistant helps you understand complex topics, generates practice questions, 
            and provides personalized study recommendations.
          </p>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Try AI Assistant
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home