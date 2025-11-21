import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Subjects</h2>
            <p className="text-gray-600 mb-4">View and manage your subjects</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              View Subjects →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Mock Tests</h2>
            <p className="text-gray-600 mb-4">Take practice tests</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              Start Test →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Previous Papers</h2>
            <p className="text-gray-600 mb-4">Practice with past exam papers</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              View Papers →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Voice Assistant</h2>
            <p className="text-gray-600 mb-4">Ask questions verbally</p>
            <Link to="/voice-assistant" className="text-blue-500 hover:text-blue-700 font-medium">
              Try Voice Assistant →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">AI Assistant</h2>
            <p className="text-gray-600 mb-4">Get AI-powered explanations</p>
            <Link to="/ai-assistant" className="text-blue-500 hover:text-blue-700 font-medium">
              Try AI Assistant →
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Performance</h2>
            <p className="text-gray-600 mb-4">View your progress and analytics</p>
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              View Analytics →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;