import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import LabPrograms from './LabPrograms';

const AllLabPrograms = () => {
    const subjects = useQuery(api.subjects.list, {}) ?? [];
    const loading = subjects === undefined;
    const [selectedSubject, setSelectedSubject] = useState(null);

    if (selectedSubject) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                <button onClick={() => setSelectedSubject(null)} className="mb-8 px-4 py-2 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm">
                    <span className="material-icons text-[20px]">arrow_back</span>
                    <span className="font-medium text-sm">Back to All Subjects</span>
                </button>
                <h2 className="text-3xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
                    <span className="material-icons text-green-400">code</span>
                    {selectedSubject.subjectName} - Lab Programs
                </h2>
                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <LabPrograms subjectCode={selectedSubject.subjectCode} />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Lab Programs <span className="text-green-400">.</span></h1>
                <p className="text-slate-400 text-lg">Access lab programs and practicals for all subjects</p>
            </div>

            {loading ? (
                <div className="text-center py-24 text-slate-500 font-mono animate-pulse">Loading subjects...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subjects.map((subject) => (
                        <div key={subject._id} onClick={() => setSelectedSubject(subject)} className="bg-card glass-panel rounded-xl group cursor-pointer hover:-translate-y-1 transition-all duration-300 border border-white/10 hover:border-green-500/30 hover:shadow-[0_8px_30px_rgba(34,197,94,0.06)] overflow-hidden flex flex-col h-full">
                            <div className="h-28 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5 flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform duration-500">
                                <span className="drop-shadow-lg">💻</span>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2 tracking-tight group-hover:text-green-400 transition-colors duration-200">{subject.subjectName}</h3>
                                <p className="text-sm font-mono text-slate-500 mb-6 flex-1">{subject.subjectCode} <span className="text-slate-600 mx-1">|</span> Sem {subject.semester}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold w-fit group-hover:bg-green-500/20 transition-colors duration-200">
                                    <span className="material-icons text-[16px]">code</span>
                                    <span>View Programs</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllLabPrograms;
