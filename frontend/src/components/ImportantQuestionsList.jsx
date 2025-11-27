import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config/api';

const ImportantQuestionsList = ({ subjectCode }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [openAnswerId, setOpenAnswerId] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                let url = `${API_BASE_URL}/important-questions/advanced/${subjectCode}`;
                if (filter !== 'all') {
                    // Simple mapping for demo, ideally backend handles complex filtering
                    if (filter === '1-mark') url += '?marks=1';
                    else if (filter === '3-mark') url += '?marks=3';
                    else if (filter === '7-mark') url += '?marks=7';
                }

                const response = await fetch(url);
                const data = await response.json();
                if (data.questions) {
                    setQuestions(data.questions);
                }
            } catch (error) {
                console.error("Error fetching questions:", error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectCode) {
            fetchQuestions();
        }
    }, [subjectCode, filter]);

    const toggleAnswer = (id) => {
        setOpenAnswerId(openAnswerId === id ? null : id);
    };

    if (loading) return <div>Loading important questions...</div>;

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-6">
                {['all', '1-mark', '3-mark', '7-mark'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? 'All Questions' : f.replace('-', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No questions found for this filter.</div>
                ) : (
                    questions.map((q) => (
                        <div key={q.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-2">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
                                        {q.marks} Marks
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                                        Unit {q.unit}
                                    </span>
                                    {q.frequency > 3 && (
                                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                                            🔥 Frequent
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Last asked: {q.last_asked_year || 'N/A'}
                                </div>
                            </div>

                            <h3 className="text-lg font-medium text-gray-900 mb-3">{q.question_text}</h3>

                            <button
                                onClick={() => toggleAnswer(q.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                {openAnswerId === q.id ? 'Hide Answer' : 'Show Answer'}
                            </button>

                            {openAnswerId === q.id && (
                                <div className="mt-3 p-4 bg-gray-50 rounded-md text-gray-700 text-sm leading-relaxed border-t border-gray-100">
                                    {q.answer_text || "Answer not available yet."}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ImportantQuestionsList;
