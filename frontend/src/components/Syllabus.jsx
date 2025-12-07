import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import FlashcardViewer from './FlashcardViewer';
import SubjectChat from './SubjectChat';

const Syllabus = () => {
  const { subjectId } = useParams();
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subject, setSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('syllabus');
  const [importantQuestions, setImportantQuestions] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [summaryModal, setSummaryModal] = useState({ show: false, content: '', loading: false, unit: null });

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) {
        setError('No subject ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch subject details
        const subjectResponse = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
        if (!subjectResponse.ok) {
          throw new Error(`Failed to fetch subject: ${subjectResponse.status}`);
        }
        const subjectData = await subjectResponse.json();

        if (subjectData.error) {
          throw new Error(subjectData.error);
        }

        setSubject(subjectData.subject);
        setSubjectName(subjectData.subject.subject_name);

        // Fetch syllabus
        const syllabusResponse = await fetch(`${API_BASE_URL}/syllabus/${subjectId}`);
        if (!syllabusResponse.ok) {
          throw new Error(`Failed to fetch syllabus: ${syllabusResponse.status}`);
        }
        const syllabusData = await syllabusResponse.json();
        setSyllabus(syllabusData.syllabus || []);

        // Fetch important questions
        const questionsResponse = await fetch(`${API_BASE_URL}/questions/important/${subjectId}`);
        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status}`);
        }
        const questionsData = await questionsResponse.json();
        setImportantQuestions(questionsData.questions || []);

        // Fetch study materials
        const materialsResponse = await fetch(`${API_BASE_URL}/study-materials/${subjectId}`);
        if (!materialsResponse.ok) {
          throw new Error(`Failed to fetch study materials: ${materialsResponse.status}`);
        }
        const materialsData = await materialsResponse.json();
        const materialsData = await materialsResponse.json();
        // Filter out KhudkiBook materials client-side as a safety net
        const filteredMaterials = (materialsData.materials || []).filter(m => m.source_name !== 'KhudkiBook');
        setStudyMaterials(filteredMaterials);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const handleSummarize = async (unitNumber) => {
    setSummaryModal({ show: true, content: '', loading: true, unit: unitNumber });
    try {
      // Try N8N webhook first
      const n8nModule = await import('../services/n8nService');
      const result = await n8nModule.explainTopic(
        subject.subject_code,
        `Unit ${unitNumber}`,
        unitNumber
      );

      if (result.success && result.data) {
        const { final_answer, answer_preview, pdfUrl } = result.data;
        let content = final_answer || answer_preview || 'Summary generated successfully.';

        if (pdfUrl) {
          content += `\n\n📄 Download PDF: ${pdfUrl}`;
        }

        setSummaryModal(prev => ({ ...prev, content, loading: false }));
      } else {
        // Fallback to existing backend
        await fallbackSummarize(unitNumber);
      }
    } catch (error) {
      console.error('N8N error, falling back to backend:', error);
      await fallbackSummarize(unitNumber);
    }
  };

  const fallbackSummarize = async (unitNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/summarize-unit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_code: subject.subject_code,
          unit_number: unitNumber,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSummaryModal(prev => ({ ...prev, content: data.summary, loading: false }));
      } else {
        setSummaryModal(prev => ({ ...prev, content: 'Failed to generate summary.', loading: false }));
      }
    } catch (error) {
      console.error('Error summarizing unit:', error);
      setSummaryModal(prev => ({ ...prev, content: 'Error connecting to server.', loading: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Error Loading Content</h2>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500 text-sm">Please check that the subject ID is correct and the backend server is running.</p>
          <div className="mt-6">
            <Link to="/subjects" className="text-blue-500 hover:text-blue-700 font-medium">
              ← Back to Subjects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{subjectName}</h1>
            <p className="text-gray-600">Course Material</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowChat(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg transform transition-all hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat with AI Tutor
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'syllabus' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('syllabus')}
          >
            Syllabus
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'important' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('important')}
          >
            Important Questions
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'materials' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('materials')}
          >
            Study Material
          </button>
        </div>

        {activeTab === 'syllabus' ? (
          <div className="space-y-6">
            {syllabus.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                No syllabus found for this subject yet.
              </div>
            ) : (
              syllabus.map((unit) => (
                <div key={unit.unit_number} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      {unit.unit_number}
                    </div>
                    <h2 className="text-xl font-semibold">{unit.unit_title}</h2>
                  </div>
                  <p className="text-gray-700 ml-11">{unit.content}</p>

                  <div className="mt-4 ml-11 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedUnit(unit.unit_number);
                        setShowFlashcards(true);
                      }}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      View Flashcards
                    </button>
                    <button
                      onClick={() => handleSummarize(unit.unit_number)}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Summarize with AI
                    </button>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Practice Questions
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'important' ? (
          <div className="space-y-6">
            {importantQuestions.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                No important questions found for this subject yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {importantQuestions.map((q) => (
                  <div key={q.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {q.marks} Marks
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Unit {q.unit_number}
                          </span>
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Asked {q.frequency_count} times
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">{q.question_text}</h3>
                      </div>
                      <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                        View Answer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {studyMaterials.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                No study materials found for this subject yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyMaterials.map((m) => (
                  <div key={m.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {m.unit && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                            Unit {m.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">{m.title}</h3>
                    {m.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{m.description}</p>
                    )}
                    <a
                      href={m.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Study Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Previous Year Papers</h3>
              <p className="text-gray-600 text-sm mb-3">Access past exam papers for practice</p>
              <Link to={`/previous-papers/${subjectId}`} className="text-blue-500 hover:text-blue-700 font-medium">
                View Papers
              </Link>
            </div>
            <div className="border border-gray-200 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Mock Tests</h3>
              <p className="text-gray-600 text-sm mb-3">Practice with full-length mock exams</p>
              <Link to={`/mock-tests/${subjectId}`} className="text-blue-500 hover:text-blue-700 font-medium">
                Take Test
              </Link>
            </div>
            <div className="border border-gray-200 p-4 rounded-md">
              <h3 className="font-semibold mb-2">Important Questions</h3>
              <p className="text-gray-600 text-sm mb-3">High probability questions for exams</p>
              <button
                onClick={() => setActiveTab('important')}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                View Questions
              </button>
            </div>
          </div>
        </div>

        {/* Flashcard Modal */}
        {showFlashcards && (
          <FlashcardViewer
            subjectCode={subject?.subject_code || subjectId}
            unit={selectedUnit}
            onClose={() => {
              setShowFlashcards(false);
              setSelectedUnit(null);
            }}
          />
        )}

        {/* Subject Chat Modal */}
        {showChat && (
          <SubjectChat
            subjectCode={subject?.subject_code || subjectId}
            subjectName={subjectName}
            onClose={() => setShowChat(false)}
          />
        )}

        {/* AI Summary Modal */}
        {summaryModal.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Unit {summaryModal.unit} Summary</h3>
                </div>
                <button
                  onClick={() => setSummaryModal(prev => ({ ...prev, show: false }))}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow">
                {summaryModal.loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                    <p className="text-gray-600 font-medium">AI is analyzing the unit content...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {summaryModal.content}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
                <button
                  onClick={() => setSummaryModal(prev => ({ ...prev, show: false }))}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Syllabus;