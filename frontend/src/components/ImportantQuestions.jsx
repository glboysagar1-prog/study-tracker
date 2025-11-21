import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ImportantQuestions = () => {
    const { subjectId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subjectName, setSubjectName] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Fetch important questions
                const response = await fetch(`/api/questions/important/${subjectId}`);
                const data = await response.json();

                if (data.questions) {
                    setQuestions(data.questions);
                }

                // Fetch subject details for the header (optional, but good for UI)
                // We can reuse the subjects API or just show generic header
                // For now, let's try to fetch subject list and find the name if possible, 
                // or just leave it generic.
                // Actually, let's fetch all subjects and filter (not efficient but works for now)
                // or just display "Important Questions"

                setLoading(false);
            } catch (error) {
                console.error('Error fetching important questions:', error);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [subjectId]);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <Link to="/subjects" className="text-blue-600 hover:text-blue-800 mr-4">
                        &larr; Back to Subjects
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Important Questions</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="text-xl text-gray-600">Loading questions...</div>
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <p className="text-gray-600 text-lg">No important questions marked for this subject yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {questions.map((q, index) => (
                            <div key={q.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">
                                            Unit {q.unit_number}
                                        </span>
                                        <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded mr-2">
                                            {q.marks} Marks
                                        </span>
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            Asked {q.frequency_count} times
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{q.question_text}</h3>
                                <div className="mt-4 flex justify-end">
                                    <button className="text-sm text-gray-500 hover:text-gray-700">
                                        View Answer Key (Coming Soon)
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

export default ImportantQuestions;
