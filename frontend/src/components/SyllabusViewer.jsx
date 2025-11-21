import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5004';

const SyllabusViewer = ({ subjectCode }) => {
    const [syllabusData, setSyllabusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedUnits, setExpandedUnits] = useState({});

    useEffect(() => {
        const fetchSyllabusDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/syllabus/details/${subjectCode}`);
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

    const toggleUnit = (unitId) => {
        setExpandedUnits(prev => ({
            ...prev,
            [unitId]: !prev[unitId]
        }));
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
                    <button
                        onClick={() => toggleUnit(unit.unit)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                                Unit {unit.unit}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800">{unit.title}</h3>
                        </div>
                        <span className={`transform transition-transform duration-200 ${expandedUnits[unit.unit] ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

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
                                                    {topic.content && <span className="text-gray-500 text-sm block mt-1">{topic.content}</span>}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Notes Section */}
                            {unit.notes.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <span>📝 Study Notes</span>
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{unit.notes.length}</span>
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {unit.notes.map((note) => (
                                            <div key={note.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                                <div className="font-medium text-blue-700 mb-1">{note.title}</div>
                                                <div className="text-xs text-gray-500 mb-2 line-clamp-2">{note.description}</div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString()}</span>
                                                    {note.file_url && (
                                                        <a
                                                            href={note.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                                                        >
                                                            View PDF
                                                        </a>
                                                    )}
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
                            {unit.topics.length === 0 && unit.notes.length === 0 && unit.questions.length === 0 && (
                                <div className="text-center text-gray-400 italic py-4">
                                    No content available for this unit yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SyllabusViewer;
