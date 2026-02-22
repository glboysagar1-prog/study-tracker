import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import MaterialCard from './MaterialCard';
import VideoPlaylist from './VideoPlaylist';
import LabPrograms from './LabPrograms';
import ImportantQuestionsList from './ImportantQuestionsList';
import SyllabusViewer from './SyllabusViewer';
import PreviousPapers from './PreviousPapers';

const SubjectLibrary = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('syllabus');

    // Fetch subject from Convex by ID
    const subject = useQuery(api.subjects.getById, subjectId ? { id: subjectId } : "skip");
    const materials = useQuery(api.studyMaterials.getBySubject, subjectId ? { subjectId } : "skip") ?? [];

    const loading = subject === undefined;

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (subject === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-transparent">
                <div className="bg-card glass-panel p-8 rounded-xl shadow-2xl max-w-2xl border border-white/10 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Subject Not Found</h2>
                    <p className="text-slate-400 mb-6 font-mono">Subject ID: {subjectId}</p>
                    <button onClick={() => navigate('/subjects')} className="px-6 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] cursor-pointer">
                        ← Back to Subjects
                    </button>
                </div>
            </div>
        );
    }

    const filteredMaterials = ['notes', 'book', 'ppt'].includes(activeTab)
        ? materials.filter(m => m.materialType === activeTab)
        : [];

    const tabs = [
        { id: 'syllabus', label: '📑 Syllabus' },
        { id: 'notes', label: '📝 Notes' },
        { id: 'papers', label: '📄 Papers' },
        { id: 'book', label: '📚 Books' },
        { id: 'video', label: '🎥 Videos' },
        { id: 'lab', label: '💻 Labs' },
        { id: 'important', label: '❓ Important Qs' },
        { id: 'ppt', label: '📊 PPTs' },
    ];

    return (
        <div className="min-h-screen bg-transparent relative z-10">
            {/* Header */}
            <div className="glass-panel border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl">
                <div className="container mx-auto px-4 pt-8 pb-4">
                    <div className="flex items-center text-sm text-slate-400 mb-3 font-mono">
                        <Link to="/subjects" className="hover:text-green-400 transition-colors duration-200">Subjects</Link>
                        <span className="mx-3 opacity-50">/</span>
                        <span className="text-slate-200">{subject.subjectName}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{subject.subjectName}</h1>
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-green-400 font-mono text-xs shadow-[0_0_10px_rgba(34,197,94,0.1)]">{subject.subjectCode}</span>
                        <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-xs">Semester {subject.semester}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-4 pt-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-5 font-medium text-sm whitespace-nowrap rounded-lg transition-all duration-200 cursor-pointer ${activeTab === tab.id
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                                    : 'bg-transparent text-slate-400 border border-transparent hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {activeTab === 'syllabus' && <SyllabusViewer subjectId={subjectId} />}

                {['notes', 'book', 'ppt'].includes(activeTab) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMaterials.length > 0 ? (
                            filteredMaterials.map(m => (
                                <MaterialCard
                                    key={m._id}
                                    material={{ ...m, id: m._id, file_url: m.content }}
                                    onDownload={(mat) => window.open(mat.content || mat.file_url, '_blank')}
                                    onBookmark={() => alert('Bookmarked!')}
                                />
                            ))
                        ) : (
                            <div className="col-span-full pt-16 pb-24 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-inner">
                                    <span className="material-icons text-3xl text-slate-500">folder_open</span>
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight mb-2">No materials found</h3>
                                <p className="text-slate-400 max-w-sm mx-auto">There are currently no {activeTab} available for this subject. Check back later.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'video' && <VideoPlaylist subjectCode={subject.subjectCode} />}
                {activeTab === 'lab' && <LabPrograms subjectCode={subject.subjectCode} />}
                {activeTab === 'papers' && <PreviousPapers subjectId={subjectId} />}
                {activeTab === 'important' && <ImportantQuestionsList subjectId={subjectId} />}
            </div>
        </div>
    );
};

export default SubjectLibrary;