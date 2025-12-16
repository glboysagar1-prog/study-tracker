import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config/api';

const SyllabusViewer = ({ subjectCode }) => {
    const [syllabusData, setSyllabusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState({});
    const [summaryModal, setSummaryModal] = useState({ show: false, content: '', loading: false, unit: null });


    const toggleUnit = (unitNumber) => {
        setExpandedUnits(prev => ({
            ...prev,
            [unitNumber]: !prev[unitNumber]
        }));
    };

    useEffect(() => {
        const fetchSyllabusDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/syllabus/details/${subjectCode}`);
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setSyllabusData(data);
                // Expand first unit by default
                if (data.units && data.units.length > 0) {
                    setExpandedUnits({ [data.units[0].unit]: true });
                }
            } catch (err) {
                console.error("Error fetching syllabus details:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (subjectCode) {
            fetchSyllabusDetails();
        }
    }, [subjectCode]);

    const handleSummarize = async (e, unitNumber) => {
        e.stopPropagation(); // Prevent toggling accordion
        setSummaryModal({ show: true, content: '', loading: true, unit: unitNumber });
        try {
            const response = await fetch(`${API_BASE_URL}/summarize-unit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: subjectCode,
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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading detailed syllabus...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!syllabusData || !syllabusData.units || syllabusData.units.length === 0) {
        return <div className="p-8 text-center text-gray-500">No detailed syllabus available for this subject.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Detailed Syllabus</h2>
                <span className="text-sm text-gray-500">{syllabusData.units.length} Units</span>
            </div>

            {syllabusData.units.map((unit) => (
                <div key={unit.unit} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Unit Header */}
                    <div
                        onClick={() => toggleUnit(unit.unit)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                                Unit {unit.unit}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800">{unit.title}</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => handleSummarize(e, unit.unit)}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm transition-all transform hover:scale-105 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Summarize
                            </button>
                            <span className={`transform transition-transform duration-200 ${expandedUnits[unit.unit] ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                    </div>

                    {/* Unit Content */}
                    {expandedUnits[unit.unit] && (
                        <div className="p-6 border-t border-gray-200 space-y-6">

                            {/* Topics Section */}
                            {unit.topics.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Topics</h4>
                                    <ul className="space-y-2">
                                        {unit.topics.map((topic, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>
                                                <span>
                                                    <span className="font-medium">{topic.topic}</span>
                                                    {/* Content hidden as per user request to reduce clutter */}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Notes Section - RESTORED */}
                            {unit.notes && unit.notes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span>📝 Study Notes</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{unit.notes.length}</span>
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {unit.notes.map((note) => (
                                            <div key={note.id} className="bg-blue-50 rounded-lg p-3 border border-blue-100 hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <p className="text-gray-800 font-medium text-sm line-clamp-2">{note.title}</p>
                                                        {note.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{note.description}</p>}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-xs text-gray-400 capitalize">{note.source_name || 'Note'}</span>
                                                    <a
                                                        href={note.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        View PDF
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Questions Section */}
                            {unit.questions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span>❓ Important Questions</span>
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">{unit.questions.length}</span>
                                    </h4>
                                    <div className="space-y-3">
                                        {unit.questions.map((q) => (
                                            <div key={q.id} className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-gray-800 font-medium text-sm">{q.question_text}</p>
                                                    <span className="bg-white text-orange-600 text-xs font-bold px-2 py-1 rounded border border-orange-200 whitespace-nowrap">
                                                        {q.marks} Marks
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                                    <span>Freq: {q.frequency}</span>
                                                    <span>Last asked: {q.last_asked_year}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State for Unit */}
                            {unit.topics.length === 0 && unit.questions.length === 0 && (
                                <div className="text-center text-gray-400 italic py-4">
                                    No content available for this unit yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

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
    );
};

export default SyllabusViewer;
