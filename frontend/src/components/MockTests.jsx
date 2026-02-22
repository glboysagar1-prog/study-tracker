import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const MockTests = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const subject = useQuery(api.subjects.getById, subjectId ? { id: subjectId } : "skip");
  const tests = useQuery(api.mockTests.getBySubject, subjectId ? { subjectId } : "skip") ?? [];

  const loading = subject === undefined;
  const subjectName = subject?.subjectName || 'Subject';

  const handleStartTest = (testId) => {
    navigate(`/mock-test/${testId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading mock tests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{subjectName}</h1>
            <p className="text-gray-600">Mock Tests</p>
          </div>
          <button
            onClick={() => alert('Mock test generation coming soon!')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            + New GTU Mock Test
          </button>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700">No mock tests available for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{test.title}</h2>
                    <p className="text-gray-600">{test.durationMinutes} minutes</p>
                  </div>
                  {test.score !== undefined && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Attempted
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Max Score:</span>
                    <span className="font-medium">{test.maxScore || 70}</span>
                  </div>

                  {test.score !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Your Score:</span>
                      <span className="font-medium">{test.score}/{test.maxScore}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleStartTest(test._id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {test.score !== undefined ? 'Retake Test' : 'Start Test'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTests;