import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MockTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Index within the section
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(9000); // 2.5 hours
  const [testStarted, setTestStarted] = useState(false);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flatQuestions, setFlatQuestions] = useState({}); // Map id -> question object

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await fetch(`/api/mock-tests/detail/${testId}`);
        const data = await response.json();

        if (data.test && data.questions) {
          setTestData(data.test);

          // Create a map for easy lookup
          const qMap = {};
          data.questions.forEach(q => {
            qMap[q.id] = q;
          });
          setFlatQuestions(qMap);

          // Set duration if available
          if (data.test.duration_minutes) {
            setTimeLeft(data.test.duration_minutes * 60);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test data:', error);
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  // Timer effect
  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [testStarted, timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleSubmit = () => {
    // Submit logic here
    navigate('/subjects');
  };

  const startTest = () => {
    setTestStarted(true);
  };

  // Helper to get current question based on navigation
  const getCurrentQuestion = () => {
    if (!testData || !testData.paper_structure) return null;

    const section = testData.paper_structure.sections[currentSectionIndex];
    if (!section) return null;

    let questionId = null;
    let alternativeId = null;
    let marks = 0;

    if (section.section_name === 'Q1') {
      // Q1 has a simple list of questions
      questionId = section.questions[currentQuestionIndex];
      marks = 1;
    } else {
      // Q2-Q5 have sub-questions (a, b, c)
      const subQ = section.sub_questions[currentQuestionIndex];
      if (subQ) {
        questionId = subQ.question_id;
        alternativeId = subQ.alternative_id;
        marks = subQ.marks;
      }
    }

    if (!questionId) return null;

    const question = flatQuestions[questionId];
    const alternativeQuestion = alternativeId ? flatQuestions[alternativeId] : null;

    return { ...question, marks, alternativeQuestion }; // Override marks from structure just in case
  };

  const handleNext = () => {
    if (!testData) return;
    const section = testData.paper_structure.sections[currentSectionIndex];

    let maxQuestionsInSection = 0;
    if (section.section_name === 'Q1') {
      maxQuestionsInSection = section.questions.length;
    } else {
      maxQuestionsInSection = section.sub_questions.length;
    }

    if (currentQuestionIndex < maxQuestionsInSection - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to next section
      if (currentSectionIndex < testData.paper_structure.sections.length - 1) {
        setCurrentSectionIndex(currentSectionIndex + 1);
        setCurrentQuestionIndex(0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      // Move to previous section
      if (currentSectionIndex > 0) {
        const prevSectionIndex = currentSectionIndex - 1;
        setCurrentSectionIndex(prevSectionIndex);

        // Set to last question of previous section
        const prevSection = testData.paper_structure.sections[prevSectionIndex];
        if (prevSection.section_name === 'Q1') {
          setCurrentQuestionIndex(prevSection.questions.length - 1);
        } else {
          setCurrentQuestionIndex(prevSection.sub_questions.length - 1);
        }
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Test...</div>;
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6">{testData?.title || 'GTU Mock Exam'}</h1>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <h3 className="font-semibold mb-2">Exam Instructions:</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>Total Time: {testData?.duration_minutes || 150} Minutes</li>
              <li>Total Marks: {testData?.max_score || 70}</li>
              <li><strong>Q1:</strong> 14 Short Questions (1 Mark each)</li>
              <li><strong>Q2-Q5:</strong> Long Questions (3, 4, 7 Marks) with Internal Options</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <button
              onClick={startTest}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const currentSection = testData.paper_structure.sections[currentSectionIndex];

  if (!currentQuestion) {
    return <div className="p-8 text-center">Question not found or empty slot. <button onClick={handleNext} className="text-blue-500">Skip</button></div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Test Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold">{testData?.title}</h1>
            <div className="flex items-center mt-1">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mr-3">
                Section {currentSection.section_name}
              </span>
              <span className="text-gray-600">
                Question {currentQuestionIndex + 1}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-gray-600 text-sm">Time Remaining</p>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 min-h-[400px]">
          <div className="flex items-start mb-6">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
              {currentSection.section_name === 'Q1' ? currentQuestionIndex + 1 : String.fromCharCode(97 + currentQuestionIndex)}
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{currentQuestion.question_text}</h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ml-4">
                  {currentQuestion.marks} Marks
                </span>
              </div>
            </div>
          </div>

          {currentQuestion.marks > 1 ? (
            <div className="ml-12">
              <textarea
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your detailed answer here..."
                value={selectedAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              />
              <div className="flex justify-between mt-2 text-gray-500 text-sm">
                <p>Word count: {(selectedAnswers[currentQuestion.id] || '').split(/\s+/).filter(w => w.length > 0).length}</p>
                <p>Detailed explanation required for {currentQuestion.marks} marks</p>
              </div>
            </div>
          ) : (
            <div className="ml-12 space-y-3">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your short answer..."
                value={selectedAnswers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              />
            </div>
          )}
          {/* Alternative Question (OR) */}
          {currentQuestion.alternativeQuestion && (
            <div className="mt-8 pt-8 border-t-2 border-gray-200 border-dashed">
              <div className="flex items-center justify-center mb-6">
                <span className="bg-gray-200 text-gray-700 font-bold px-4 py-1 rounded-full">OR</span>
              </div>

              <div className="flex items-start mb-6">
                <div className="bg-gray-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                  {String.fromCharCode(97 + currentQuestionIndex)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{currentQuestion.alternativeQuestion.question_text}</h2>
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ml-4">
                      {currentQuestion.marks} Marks
                    </span>
                  </div>
                </div>
              </div>

              <div className="ml-12">
                <textarea
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your detailed answer here (Alternative Question)..."
                  value={selectedAnswers[currentQuestion.alternativeQuestion.id] || ''}
                  onChange={(e) => handleAnswerSelect(currentQuestion.alternativeQuestion.id, e.target.value)}
                />
                <div className="flex justify-between mt-2 text-gray-500 text-sm">
                  <p>Word count: {(selectedAnswers[currentQuestion.alternativeQuestion.id] || '').split(/\s+/).filter(w => w.length > 0).length}</p>
                  <p>Detailed explanation required for {currentQuestion.marks} marks</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${currentSectionIndex === 0 && currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
          >
            Previous
          </button>

          <div className="flex gap-2 overflow-x-auto max-w-md px-2">
            {/* Mini navigation for current section */}
            {currentSection.section_name === 'Q1' ? (
              currentSection.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full text-xs font-medium flex-shrink-0 ${currentQuestionIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {idx + 1}
                </button>
              ))
            ) : (
              currentSection.sub_questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-8 h-8 rounded-full text-xs font-medium flex-shrink-0 ${currentQuestionIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {String.fromCharCode(97 + idx)}
                </button>
              ))
            )}
          </div>

          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockTest;