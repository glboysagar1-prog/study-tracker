import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import SubjectChat from './SubjectChat';

const Syllabus = () => {
    const { subjectId } = useParams();
    const [subject, setSubject] = useState({});
    const [subjectName, setSubjectName] = useState('');
    const [syllabus, setSyllabus] = useState([]);
    const [importantQuestions, setImportantQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('syllabus');
    const [showChat, setShowChat] = useState(false);
    const [summaryModal, setSummaryModal] = useState({ show: false, content: '', loading: false, unit: null });
    const [showFlashcards, setShowFlashcards] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subject details
                const subjectResponse = await fetch(`${API_BASE_URL}/subjects/${subjectId}`);
                const subjectData = await subjectResponse.json();
                if (!subjectData.success) throw new Error(subjectData.error);
                setSubject(subjectData.subject);
                setSubjectName(subjectData.subject.name);

                // Fetch syllabus
                const syllabusResponse = await fetch(`${API_BASE_URL}/syllabus/${subjectId}`);
                const syllabusData = await syllabusResponse.json();
                if (!syllabusData.success) throw new Error(syllabusData.error);
                setSyllabus(syllabusData.units || []);

                // Fetch important questions
                const questionsResponse = await fetch(`${API_BASE_URL}/important-questions/${subjectId}`);
                const questionsData = await questionsResponse.json();
                if (!questionsData.success) throw new Error(questionsData.error);
                setImportantQuestions(questionsData.questions || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subjectId]);

    const handleSummarize = async (unitNumber) => {
        setSummaryModal({ show: true, content: '', loading: true, unit: unitNumber });
        try {
            // Use local AI service directly
            await summarizeUnit(unitNumber);
        } catch (error) {
            console.error('AI service error:', error);
            setSummaryModal(prev => ({ ...prev, content: 'Error connecting to server.', loading: false }));
        }
    };

    const summarizeUnit = async (unitNumber) => {
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
                                                </div>
                                                <h3 className="font-medium text-gray-900">{q.question_text}</h3>
                                            </div>
                                            <span className="text-xs text-gray-500">{q.probability} Probability</span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                View Answer
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                                                Mark Important
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
                        Study material tab content coming soon...
                    </div>
                )}
            </div>

            {/* Subject Chat Modal */}
            {showChat && (
                <SubjectChat
                    subjectCode={subject.subject_code}
                    subjectName={subjectName}
                    onClose={() => setShowChat(false)}
                />
            )}

            {/* Summary Modal */}
            {summaryModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-xl font-bold">AI Summary - Unit {summaryModal.unit}</h3>
                            <button
                                onClick={() => setSummaryModal({ show: false, content: '', loading: false, unit: null })}
                                className="text-white hover:text-gray-200 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto">
                            {summaryModal.loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                                </div>
                            ) : (
                                <div className="prose max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: summaryModal.content.replace(/\n/g, '<br>') }} />
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg text-right">
                            <button
                                onClick={() => setSummaryModal({ show: false, content: '', loading: false, unit: null })}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Flashcards Modal */}
            {showFlashcards && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                            <h3 className="text-xl font-bold">Flashcards - Unit {selectedUnit}</h3>
                            <button
                                onClick={() => setShowFlashcards(false)}
                                className="text-white hover:text-gray-200 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <div className="flex-grow p-6 overflow-y-auto">
                            <div className="text-center text-gray-500">
                                Flashcards feature coming soon...
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg text-right">
                            <button
                                onClick={() => setShowFlashcards(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Syllabus;