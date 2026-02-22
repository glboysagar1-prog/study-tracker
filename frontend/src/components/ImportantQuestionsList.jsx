import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const ImportantQuestionsList = ({ subjectId }) => {
    const allQuestions = useQuery(api.questions.getBySubject, subjectId ? { subjectId } : "skip") ?? [];
    const loading = allQuestions === undefined;
    const [filter, setFilter] = useState('all');
    const [openAnswerId, setOpenAnswerId] = useState(null);

    const questions = filter === 'all'
        ? allQuestions.filter(q => q.isImportant)
        : allQuestions.filter(q => {
            if (filter === '1-mark') return q.marks === 1;
            if (filter === '3-mark') return q.marks <= 4 && q.marks > 1;
            if (filter === '7-mark') return q.marks >= 7;
            return true;
        });

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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${filter === f
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                            }`}
                    >
                        {f === 'all' ? 'All Questions' : f.replace('-', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center text-slate-500 py-12 bg-white/5 rounded-xl border border-white/10 font-mono">No questions found for this filter.</div>
                ) : (
                    questions.map((q) => (
                        <div key={q._id} className="bg-card glass-panel rounded-xl shadow-sm border border-white/10 p-5 group hover:border-white/20 transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-2">
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                                        {q.marks} Marks
                                    </span>
                                    <span className="bg-white/10 text-slate-300 border border-white/10 text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                                        Unit {q.unitNumber}
                                    </span>
                                    {q.frequencyCount > 3 && (
                                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                                            🔥 Frequent
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                    Type: {q.questionType}
                                </div>
                            </div>

                            <h3 className="text-lg font-medium text-white mb-4 leading-relaxed group-hover:text-green-400 transition-colors duration-200">{q.questionText}</h3>

                            <button
                                onClick={() => toggleAnswer(q._id)}
                                className="text-green-400 hover:text-white text-sm font-mono flex items-center gap-1 transition-colors duration-200 cursor-pointer"
                            >
                                <span className={`material-icons text-[16px] transition-transform duration-300 ${openAnswerId === q._id ? 'rotate-180' : ''}`}>expand_more</span>
                                {openAnswerId === q._id ? 'Hide Answer' : 'Show Answer'}
                            </button>

                            {openAnswerId === q._id && (
                                <div className="mt-4 p-4 bg-black/20 rounded-lg text-slate-300 text-sm leading-relaxed border-t border-white/5 font-mono">
                                    Answer not available yet.
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
