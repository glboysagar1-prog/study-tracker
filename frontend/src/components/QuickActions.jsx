import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';

const QuickActions = ({ subjectCode, subjectName, onActionComplete }) => {
    const [loading, setLoading] = useState(null);
    const [result, setResult] = useState(null);

    const handleAction = async (actionType, actionLabel) => {
        setLoading(actionType);
        setResult(null);

        try {
            // Use local AI service directly
            let response;
            
            switch (actionType) {
                case 'notes':
                    response = await generateNotes(subjectCode, null, subjectName);
                    break;
                case 'quiz':
                    response = await generateQuiz(subjectCode);
                    break;
                case 'important':
                    response = await getImportantQuestions(subjectCode, subjectName);
                    break;
                case 'papers':
                    response = await getPreviousPapers(subjectCode, subjectName);
                    break;
                default:
                    throw new Error('Unknown action type');
            }

            if (response.success) {
                setResult({
                    type: 'success',
                    message: response.message || 'Action completed successfully!',
                    suggestions: response.suggestions || []
                });

                if (onActionComplete) {
                    onActionComplete(response.data);
                }
            } else {
                setResult({
                    type: 'error',
                    message: response.error || 'Failed to complete action. Please try again.'
                });
            }
        } catch (error) {
            console.error(`Error in ${actionType} action:`, error);
            setResult({
                type: 'error',
                message: 'An error occurred. Please try again later.'
            });
        } finally {
            setLoading(null);
        }
    };

    // Local AI service functions
    const generateNotes = async (subjectCode, unit, topic = null) => {
        try {
            const response = await fetch(`${API_BASE_URL}/generate-notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subject_code: subjectCode, 
                    unit: unit, 
                    topic: topic 
                })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const generateQuiz = async (subjectCode, difficulty = 'medium', topics = []) => {
        try {
            const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subject_code: subjectCode, 
                    difficulty: difficulty, 
                    topics: topics 
                })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getImportantQuestions = async (subjectCode, subjectName, unit = null) => {
        try {
            const response = await fetch(`${API_BASE_URL}/important-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subject_code: subjectCode, 
                    subject_name: subjectName, 
                    unit: unit 
                })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getPreviousPapers = async (subjectCode, subjectName, year = null) => {
        try {
            const response = await fetch(`${API_BASE_URL}/previous-papers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subject_code: subjectCode, 
                    subject_name: subjectName, 
                    year: year 
                })
            });
            return await response.json();
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const actions = [
        {
            type: 'notes',
            label: 'Generate Notes',
            icon: '📝',
            color: 'from-blue-500 to-indigo-500',
            hoverColor: 'from-blue-600 to-indigo-600'
        },
        {
            type: 'quiz',
            label: 'Create Quiz',
            icon: '🎯',
            color: 'from-purple-500 to-pink-500',
            hoverColor: 'from-purple-600 to-pink-600'
        },
        {
            type: 'important',
            label: 'Important Questions',
            icon: '⭐',
            color: 'from-yellow-500 to-orange-500',
            hoverColor: 'from-yellow-600 to-orange-600'
        },
        {
            type: 'papers',
            label: 'Practice Papers',
            icon: '📄',
            color: 'from-green-500 to-teal-500',
            hoverColor: 'from-green-600 to-teal-600'
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Powered Quick Actions</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.type}
                        onClick={() => handleAction(action.type, action.label)}
                        disabled={loading !== null}
                        className={`bg-gradient-to-r ${action.color} hover:${action.hoverColor} text-white px-4 py-3 rounded-lg font-medium flex flex-col items-center gap-2 shadow-md transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                        <span className="text-2xl">{action.icon}</span>
                        <span className="text-sm">{action.label}</span>
                        {loading === action.type && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Result Display */}
            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {result.message}
                    </p>
                    {result.suggestions && result.suggestions.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Next steps:</p>
                            <div className="flex flex-wrap gap-2">
                                {result.suggestions.map((suggestion, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-white px-3 py-1 rounded-full border border-gray-300 text-gray-700"
                                    >
                                        {suggestion}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuickActions;