import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const LabPrograms = ({ subjectCode }) => {
    const programs = useQuery(api.studyMaterials.getBySubjectCode,
        subjectCode ? { subjectCode, materialType: 'lab' } : "skip"
    ) ?? [];
    const loading = programs === undefined;
    const [openProgramId, setOpenProgramId] = useState(null);

    const toggleProgram = (id) => {
        setOpenProgramId(openProgramId === id ? null : id);
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!");
    };

    if (loading) return <div>Loading lab programs...</div>;

    if (programs.length === 0) {
        return <div className="text-center text-gray-500 py-8">No lab programs found for this subject.</div>;
    }

    return (
        <div className="space-y-4">
            {programs.map((program, idx) => (
                <div key={program._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleProgram(program._id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-3">
                                Prac {idx + 1}
                            </span>
                            <span className="font-medium text-gray-800">{program.title}</span>
                        </div>
                        <span className="text-gray-400">
                            {openProgramId === program._id ? '−' : '+'}
                        </span>
                    </button>

                    {openProgramId === program._id && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            {program.content && (
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase">Code</h4>
                                        <button
                                            onClick={() => copyCode(program.content)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            📋 Copy Code
                                        </button>
                                    </div>
                                    <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                                        <code>{program.content}</code>
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default LabPrograms;
