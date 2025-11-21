import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5004';

const LabPrograms = ({ subjectCode }) => {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openProgramId, setOpenProgramId] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/lab-programs/${subjectCode}`);
                const data = await response.json();
                if (data.programs) {
                    setPrograms(data.programs);
                }
            } catch (error) {
                console.error("Error fetching lab programs:", error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectCode) {
            fetchPrograms();
        }
    }, [subjectCode]);

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
            {programs.map((program) => (
                <div key={program.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <button
                        onClick={() => toggleProgram(program.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-3">
                                Prac {program.practical_number}
                            </span>
                            <span className="font-medium text-gray-800">{program.program_title}</span>
                        </div>
                        <span className="text-gray-400">
                            {openProgramId === program.id ? '−' : '+'}
                        </span>
                    </button>

                    {openProgramId === program.id && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase mb-1">Aim</h4>
                                <p className="text-gray-600">{program.aim}</p>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase">Code ({program.language})</h4>
                                    <button
                                        onClick={() => copyCode(program.code)}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        📋 Copy Code
                                    </button>
                                </div>
                                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                                    <code>{program.code}</code>
                                </pre>
                            </div>

                            {program.output && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-1">Output</h4>
                                    <pre className="bg-black text-green-400 p-4 rounded-md overflow-x-auto text-sm font-mono">
                                        {program.output}
                                    </pre>
                                </div>
                            )}

                            {program.viva_questions && program.viva_questions.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-1">Viva Questions</h4>
                                    <ul className="list-disc list-inside text-gray-600 text-sm">
                                        {program.viva_questions.map((q, i) => (
                                            <li key={i}>{q}</li>
                                        ))}
                                    </ul>
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
