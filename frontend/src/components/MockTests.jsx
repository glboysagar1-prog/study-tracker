import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MockTests = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    const fetchTestsData = async () => {
      try {
        // Fetch subject details
        const subjectResponse = await fetch(`/api/subjects`);
        const subjectData = await subjectResponse.json();

        // Find the current subject
        const currentSubject = subjectData.subjects.find(s => s.id === parseInt(subjectId));
        if (currentSubject) {
          setSubjectName(currentSubject.subject_name);
        }

        // Fetch mock tests data
        const response = await fetch(`/api/mock-tests/${subjectId}`);
        const data = await response.json();

        if (data.tests) {
          setTests(data.tests);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching tests:', error);
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchTestsData();
    }
  }, [subjectId]);

  const handleStartTest = (testId) => {
    navigate(`/mock-test/${testId}`);
  };

  const handleGenerateTest = async () => {
    try {
      const response = await fetch('/api/mock-tests/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject_id: parseInt(subjectId),
          title: `${subjectName} - GTU Mock Test`
        })
      });
      const data = await response.json();

      if (data.success) {
        navigate(`/mock-test/${data.test_id}`);
      } else {
        alert('Failed to generate test: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Error generating test');
    }
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
            onClick={handleGenerateTest}
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
              <div key={test.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{test.title || `Mock Test ${test.id}`}</h2>
                    <p className="text-gray-600">{test.duration_minutes} minutes</p>
                  </div>
                  {test.score !== undefined && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Attempted
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Questions:</span>
                    <span className="font-medium">14</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700">Max Score:</span>
                    <span className="font-medium">70</span>
                  </div>

                  {test.score !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Your Score:</span>
                      <span className="font-medium">{test.score}/{test.max_score}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => handleStartTest(test.id)}
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