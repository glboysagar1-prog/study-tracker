import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const PrepareExam = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [filters, setFilters] = useState({ course: '', branch: '', semester: '' });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [predictedPaper, setPredictedPaper] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [answerLoading, setAnswerLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');

    const metadata = useQuery(api.subjects.getMetadata) ?? { courses: [], branches: [], semesters: [] };
    const subjects = useQuery(api.subjects.list, {
        course: filters.course || undefined,
        branch: filters.branch || undefined,
        semester: filters.semester || undefined,
    }) ?? [];

    const chat = useAction(api.ai.chat);
    const loading = subjects === undefined;

    const handleSubjectSelect = (subject) => {
        setSelectedSubject(subject);
        setStep(2);
    };

    const handleMainOption = (option) => {
        if (option === 'study') {
            navigate(`/syllabus/${selectedSubject._id}`);
        } else {
            setStep(3);
        }
    };

    const handleAiOption = async (option) => {
        if (option === 'pyq') {
            navigate(`/previous-papers/${selectedSubject._id}`);
        } else if (option === 'summary') {
            navigate(`/syllabus/${selectedSubject._id}`);
        } else if (option === 'advanced') {
            setStep(4);
            setPredicting(true);
            try {
                const result = await chat({
                    prompt: `Generate a predicted GTU exam paper for ${selectedSubject.subjectName} (${selectedSubject.subjectCode}). Create 14 questions in GTU format with sections: Section A (1-mark MCQs), Section B (3-4 mark short answers), Section C (7-mark long answers). Include unit numbers, marks, and probability (High/Medium/Low). Return as JSON with format: { "questions": [{ "q_number": "Q1(a)", "question": "...", "marks": 1, "unit": "Unit 1", "probability": "High" }] }`
                });
                try {
                    const parsed = JSON.parse(result);
                    setPredictedPaper(parsed);
                } catch {
                    setPredictedPaper({ raw: result });
                }
            } catch (error) {
                console.error('Error predicting paper:', error);
                setPredictedPaper(null);
            } finally {
                setPredicting(false);
            }
        }
    };

    const handleGetAnswer = async (question) => {
        setCurrentQuestion(question);
        setShowAnswerModal(true);
        setAnswerLoading(true);
        setCurrentAnswer(null);
        try {
            const result = await chat({
                prompt: `As a GTU exam expert, provide a detailed answer for this question from ${selectedSubject?.subjectName}: "${question}". Write in exam-appropriate format with proper explanations, diagrams suggestions where needed, and mark-wise content.`
            });
            setCurrentAnswer({ answer: result });
        } catch (error) {
            console.error('Error fetching answer:', error);
            setCurrentAnswer(null);
        } finally {
            setAnswerLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        🚀 Prepare Exam with AI
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Smart exam preparation powered by AI analysis</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-10">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{s}</div>
                                {s < 4 && <div className={`w-12 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 1: Select Details */}
                {step === 1 && (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Select Your Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Course</label>
                                <select className="w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-indigo-500" value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
                                    <option value="">Select Course</option>
                                    {metadata.courses?.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Branch</label>
                                <select className="w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-indigo-500" value={filters.branch} onChange={(e) => setFilters({ ...filters, branch: e.target.value })}>
                                    <option value="">Select Branch</option>
                                    {metadata.branches?.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Semester</label>
                                <select className="w-full p-4 border-2 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-indigo-500" value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })}>
                                    <option value="">Select Semester</option>
                                    {metadata.semesters?.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                            </div>
                        ) : subjects.length > 0 ? (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Select Subject</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subjects.map(subject => (
                                        <button key={subject._id} onClick={() => handleSubjectSelect(subject)} className="p-5 text-left border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group">
                                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600">{subject.subjectName}</div>
                                            <div className="text-sm text-gray-500 mt-1">{subject.subjectCode}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : filters.semester && (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-lg">No subjects found for selected criteria.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Main Options */}
                {step === 2 && selectedSubject && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(1)} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
                            <div className="inline-block px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium mb-4">
                                {selectedSubject.subjectCode}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{selectedSubject.subjectName}</h2>
                            <p className="text-gray-500 mb-10">How would you like to proceed?</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                <button onClick={() => handleMainOption('study')} className="p-8 border-2 border-emerald-100 dark:border-emerald-900 rounded-2xl hover:border-emerald-500 hover:shadow-xl transition-all group bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📚</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Study Full Subject</h3>
                                    <p className="text-gray-500 text-sm">Access comprehensive study materials, notes, and videos</p>
                                </button>

                                <button onClick={() => handleMainOption('ai')} className="p-8 border-2 border-purple-100 dark:border-purple-900 rounded-2xl hover:border-purple-500 hover:shadow-xl transition-all group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Prepare with AI</h3>
                                    <p className="text-gray-500 text-sm">Smart exam prep with predicted papers and AI answers</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: AI Options */}
                {step === 3 && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(2)} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">AI Exam Preparation</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button onClick={() => handleAiOption('pyq')} className="p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-center group">
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Previous Year Papers</h3>
                                    <p className="text-sm text-gray-500">View and practice past exam papers</p>
                                </button>

                                <button onClick={() => handleAiOption('summary')} className="p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-green-500 hover:shadow-lg transition-all text-center group">
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Subject Summary</h3>
                                    <p className="text-sm text-gray-500">Get concise summaries of key topics</p>
                                </button>

                                <button onClick={() => handleAiOption('advanced')} className="p-6 border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl hover:shadow-lg transition-all text-center group relative overflow-hidden">
                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full font-bold">NEW</div>
                                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔮</div>
                                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Advanced GTU Paper</h3>
                                    <p className="text-sm text-gray-500">AI predicts questions based on past patterns</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Predicted Paper */}
                {step === 4 && (
                    <div className="space-y-6">
                        <button onClick={() => setStep(3)} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-4xl">🔮</span>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced GTU Predicted Paper</h2>
                                    <p className="text-gray-500">{selectedSubject?.subjectName}</p>
                                </div>
                            </div>

                            {predicting ? (
                                <div className="text-center py-16">
                                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
                                    <p className="text-xl text-gray-600 dark:text-gray-300">Analyzing previous year patterns...</p>
                                    <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
                                </div>
                            ) : predictedPaper ? (
                                <div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            <strong>⚠️ Disclaimer:</strong> This paper is AI-generated based on past trends. Use it for practice only.
                                        </p>
                                    </div>

                                    {predictedPaper.questions ? (
                                        <div className="space-y-4">
                                            {predictedPaper.questions.map((q, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-100 dark:border-gray-600">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{q.q_number}</span>
                                                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{q.marks} Marks</span>
                                                        {q.unit && <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">{q.unit}</span>}
                                                        {q.probability === 'High' && <span className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">🔥 High Probability</span>}
                                                    </div>
                                                    <p className="text-gray-800 dark:text-gray-200 mb-3">{q.question}</p>
                                                    <button onClick={() => handleGetAnswer(q.question)} className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                                                        <span>🧠</span> Get AI Answer
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border overflow-auto max-h-[60vh]">
                                            {predictedPaper.raw || JSON.stringify(predictedPaper, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-red-500">
                                    <p className="text-xl">Failed to generate paper. Please try again.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AI Answer Modal */}
                {showAnswerModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2"><span>🧠</span> AI Generated Answer</h3>
                                <button onClick={() => setShowAnswerModal(false)} className="text-white/80 hover:text-white text-2xl">×</button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Question:</p>
                                    <p className="text-gray-800 dark:text-gray-200">{currentQuestion}</p>
                                </div>

                                {answerLoading ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                                        <p className="text-gray-500">Generating perfect GTU answer...</p>
                                    </div>
                                ) : currentAnswer ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-0 border-0">
                                            {currentAnswer.answer}
                                        </pre>
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-center py-8">Failed to generate answer. Please try again.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrepareExam;
