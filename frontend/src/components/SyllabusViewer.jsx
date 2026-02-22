import React, { useState } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SyllabusViewer = ({ subjectId }) => {
    const syllabusData = useQuery(api.syllabus.getBySubject, subjectId ? { subjectId } : "skip") ?? [];
    const summarizeUnit = useAction(api.ai.summarizeUnit);

    const loading = syllabusData === undefined;
    const [expandedUnits, setExpandedUnits] = useState({});
    const [summaryModal, setSummaryModal] = useState({ show: false, content: '', loading: false, unit: null });

    const toggleUnit = (unitNumber) => {
        setExpandedUnits(prev => ({
            ...prev,
            [unitNumber]: !prev[unitNumber]
        }));
    };

    // Auto-expand the first unit
    if (syllabusData.length > 0 && Object.keys(expandedUnits).length === 0) {
        setExpandedUnits({ [syllabusData[0].unitNumber]: true });
    }

    const handleSummarize = async (e, unitNumber) => {
        e.stopPropagation();
        setSummaryModal({ show: true, content: '', loading: true, unit: unitNumber });
        try {
            const result = await summarizeUnit({ subjectId, unitNumber });
            setSummaryModal(prev => ({ ...prev, content: result, loading: false }));
        } catch (error) {
            console.error('Error summarizing unit:', error);
            setSummaryModal(prev => ({ ...prev, content: 'Error generating summary.', loading: false }));
        }
    };

    const materials = useQuery(api.studyMaterials.getBySubject, subjectId ? { subjectId } : "skip") ?? [];
    const syllabusPdfs = materials.filter(m => m.materialType === 'syllabus');

    // Parse topics by spliting commas or newlines
    const parseTopics = (content) => {
        if (!content) return [];
        return content.split(/\n|,/).map(t => t.trim()).filter(t => t.length > 2);
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-mono animate-pulse">Loading detailed syllabus...</div>;
    if (syllabusData.length === 0 && syllabusPdfs.length === 0) {
        return (
            <div className="p-12 text-center text-slate-400 bg-white/5 rounded-xl border border-white/10 font-mono">
                No detailed syllabus available for this subject.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">Detailed Syllabus <span className="text-green-400">.</span></h2>
                {syllabusData.length > 0 && <span className="text-xs font-bold font-mono text-slate-400 px-3 py-1 bg-white/5 rounded-full border border-white/10">{syllabusData.length} Units</span>}
            </div>

            {/* Display Syllabus PDFs if they exist */}
            {syllabusPdfs.length > 0 && (
                <div className="bg-card glass-panel rounded-xl border border-blue-500/20 p-5 mb-6 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <span className="material-icons text-blue-400">picture_as_pdf</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">Official GTU Syllabus</h3>
                            <p className="text-sm text-slate-400 font-medium">Download the complete syllabus document</p>
                        </div>
                    </div>
                    {syllabusPdfs.map(pdf => (
                        <a
                            key={pdf._id}
                            href={pdf.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-5 py-2.5 rounded-lg border border-blue-500/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                        >
                            <span>Download PDF</span>
                            <span className="material-icons text-[18px]">download</span>
                        </a>
                    ))}
                </div>
            )}

            {syllabusData.length === 0 && syllabusPdfs.length > 0 && (
                <div className="p-8 text-center text-slate-400 bg-white/5 rounded-xl border border-white/10 font-mono text-sm leading-relaxed">
                    Detailed unit-by-unit syllabus data is not yet available for this subject, but you can download the official GTU Syllabus PDF above.
                </div>
            )}

            {syllabusData.map((unit) => {
                const topics = parseTopics(unit.content);
                // Get notes that belong specifically to this unit (or if none specify a unit, fallback to general notes for demo)
                const unitNotes = materials.filter(m => m.materialType === 'notes' && (m.unit === unit.unitNumber || !m.unit));

                return (
                    <div key={unit._id} className="bg-card glass-panel rounded-xl border border-white/10 overflow-hidden shadow-lg mb-6 transition-all duration-300">
                        {/* Unit Header */}
                        <div
                            onClick={() => toggleUnit(unit.unitNumber)}
                            className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/30 transition-colors">
                                    Unit {unit.unitNumber}
                                </span>
                                <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-green-400 transition-colors">{unit.unitTitle}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => handleSummarize(e, unit.unitNumber)}
                                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all transform hover:-translate-y-0.5 shadow-sm shadow-amber-500/10 cursor-pointer"
                                >
                                    <span className="material-icons text-[16px]">auto_awesome</span>
                                    Summarize
                                </button>
                                <span className={`material-icons text-slate-400 transform transition-transform duration-300 ${expandedUnits[unit.unitNumber] ? 'rotate-180 text-green-400' : ''}`}>
                                    arrow_drop_down
                                </span>
                            </div>
                        </div>

                        {/* Unit Content */}
                        {expandedUnits[unit.unitNumber] && (
                            <div className="p-8 border-t border-white/5 space-y-10 bg-black/20">
                                {/* Topics Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> Topics
                                    </h4>
                                    {topics.length > 0 ? (
                                        <ul className="space-y-3 pl-2">
                                            {topics.map((topic, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <span className="text-blue-400/60 font-bold mt-1.5 min-w-[12px]">•</span>
                                                    <span className="text-slate-300 leading-relaxed font-medium">{topic}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-slate-500 italic py-2 text-sm">No specific topics listed.</div>
                                    )}
                                </div>

                                {/* Study Notes Section */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Study Notes
                                        <span className="ml-2 bg-white/10 text-slate-300 px-2 py-0.5 rounded-full text-[10px]">{unitNotes.length}</span>
                                    </h4>
                                    {unitNotes.length > 0 ? (
                                        <div className="grid gap-4">
                                            {unitNotes.map(note => (
                                                <div key={note._id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-colors flex justify-between items-center group/card cursor-pointer">
                                                    <div className="pr-6">
                                                        <h5 className="font-bold text-white tracking-tight mb-1">{note.title || `${subjectId} - Unit ${unit.unitNumber} Notes`}</h5>
                                                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">Topics covered: {topics.slice(0, 5).join(', ')}{topics.length > 5 ? '...' : ''}</p>
                                                        <p className="text-xs text-slate-500 font-mono mt-3">AI-Generated (GTU Exam Prep)</p>
                                                    </div>
                                                    <a
                                                        href={note.content}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="shrink-0 flex items-center gap-2 text-sm font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 px-4 py-2 rounded-lg border border-green-500/20 transition-all cursor-pointer group-hover/card:shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                                    >
                                                        <span className="material-icons text-[18px]">file_download</span>
                                                        View PDF
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white/5 border border-white/5 rounded-xl p-6 text-center text-sm text-slate-500 font-mono">
                                            No study notes uploaded for this unit yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* AI Summary Modal */}
            {summaryModal.show && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card glass-panel rounded-2xl border border-white/10 shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 shadow-inner">
                                    <span className="material-icons text-amber-400">auto_awesome</span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Unit {summaryModal.unit} Summary</h3>
                            </div>
                            <button onClick={() => setSummaryModal(prev => ({ ...prev, show: false }))} className="text-slate-500 hover:text-white transition-colors cursor-pointer w-8 h-8 flex flex-col justify-center items-center rounded-full hover:bg-white/10">
                                <span className="material-icons">close</span>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-grow bg-black/20">
                            {summaryModal.loading ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-amber-500 mb-6 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                    <p className="text-white font-medium mb-2 tracking-wide">AI is analyzing the unit content...</p>
                                    <p className="text-slate-500 text-sm font-mono">This may take a few seconds</p>
                                </div>
                            ) : (
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-sans">{summaryModal.content}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-white/5 bg-white/5 flex justify-end">
                            <button
                                onClick={() => setSummaryModal(prev => ({ ...prev, show: false }))}
                                className="px-6 py-2.5 bg-white/10 border border-white/10 rounded-lg text-white hover:bg-white/20 font-medium transition-all cursor-pointer"
                            >Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusViewer;
