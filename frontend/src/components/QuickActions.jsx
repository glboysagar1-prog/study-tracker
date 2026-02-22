import React, { useState } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const QuickActions = ({ subjectCode, subjectName, onActionComplete }) => {
    const [loading, setLoading] = useState(null);
    const [result, setResult] = useState(null);
    const chat = useAction(api.ai.chat);

    const handleAction = async (actionType) => {
        setLoading(actionType);
        setResult(null);

        try {
            let prompt;
            switch (actionType) {
                case 'notes':
                    prompt = `Generate concise study notes for the GTU subject "${subjectName}" (${subjectCode}). Cover key topics, definitions, and important concepts.`;
                    break;
                case 'quiz':
                    prompt = `Create a 10-question quiz for the GTU subject "${subjectName}" (${subjectCode}). Include MCQs and short answer questions with answers.`;
                    break;
                case 'important':
                    prompt = `List the most important questions likely to appear in the GTU exam for "${subjectName}" (${subjectCode}). Categorize by unit and include mark weightage.`;
                    break;
                case 'papers':
                    prompt = `Generate a practice paper in GTU exam format for "${subjectName}" (${subjectCode}). Include Section A (MCQ), Section B (short answers), and Section C (long answers).`;
                    break;
                default:
                    throw new Error('Unknown action type');
            }

            const response = await chat({ prompt });
            setResult({
                type: 'success',
                message: response
            });

            if (onActionComplete) onActionComplete(response);
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

    const actions = [
        { type: 'notes', label: 'Generate Notes', icon: '📝', color: 'from-blue-500 to-indigo-500' },
        { type: 'quiz', label: 'Create Quiz', icon: '🎯', color: 'from-purple-500 to-pink-500' },
        { type: 'important', label: 'Important Questions', icon: '⭐', color: 'from-yellow-500 to-orange-500' },
        { type: 'papers', label: 'Practice Papers', icon: '📄', color: 'from-green-500 to-teal-500' }
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">AI-Powered Quick Actions</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.type}
                        onClick={() => handleAction(action.type)}
                        disabled={loading !== null}
                        className={`bg-gradient-to-r ${action.color} text-white px-4 py-3 rounded-lg font-medium flex flex-col items-center gap-2 shadow-md transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                        <span className="text-2xl">{action.icon}</span>
                        <span className="text-sm">{action.label}</span>
                        {loading === action.type && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                    </button>
                ))}
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded-lg ${result.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <pre className={`text-sm whitespace-pre-wrap font-sans ${result.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {result.message}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default QuickActions;