import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import './MaterialViewer.css';
import { BorderBeam } from './ui/BorderBeam';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MaterialViewer = ({ subjectCode }) => {
    const subject = useQuery(api.subjects.getByCode, subjectCode ? { subjectCode } : "skip");
    const subjectId = subject?._id;
    const materials = useQuery(api.studyMaterials.getBySubject, subjectId ? { subjectId } : "skip") ?? [];
    const questions = useQuery(api.questions.getBySubject, subjectId ? { subjectId } : "skip") ?? [];
    const syllabusData = useQuery(api.syllabus.getBySubject, subjectId ? { subjectId } : "skip") ?? [];

    const [activeTab, setActiveTab] = useState('notes');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const loading = subject === undefined;

    // Granular Resource Categorization
    const notes = materials.filter(m => m.materialType === 'notes');
    const syllabusFiles = materials.filter(m => m.materialType === 'syllabus');
    const papers = materials.filter(m => m.materialType === 'paper');
    const books = materials.filter(m => m.materialType === 'book');
    const videos = materials.filter(m => m.materialType === 'video');
    const labs = materials.filter(m => m.materialType === 'lab');
    const imps = materials.filter(m => m.materialType === 'imp');
    const ppts = materials.filter(m => m.materialType === 'ppt');

    const getUnits = () => {
        const units = new Set();
        materials.forEach(m => m.unit && units.add(m.unit));
        questions.forEach(q => q.unitNumber && units.add(q.unitNumber));
        return Array.from(units).sort((a, b) => a - b);
    };

    const filterByUnit = (items, unitField = 'unit') => {
        if (!selectedUnit) return items;
        return items.filter(item => item[unitField] === selectedUnit);
    };

    const getPreviewUrl = (url) => {
        if (!url) return null;
        if (url.includes('drive.google.com')) {
            const viewMatch = url.match(/\/file\/d\/([^\/]+)/);
            if (viewMatch) return `https://drive.google.com/file/d/${viewMatch[1]}/preview`;
            const openMatch = url.match(/[?&]id=([^&]+)/);
            if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
        }
        return url;
    };

    const openPreview = (url) => setPreviewUrl(getPreviewUrl(url));
    const closePreview = () => setPreviewUrl(null);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="text-xl text-indigo-400 font-medium animate-pulse">Loading materials...</div>
            </div>
        );
    }

    if (!subject) {
        return (
            <Card className="glass-panel border-0 p-12 rounded-3xl text-center max-w-lg mx-auto mt-20 bg-transparent text-white">
                <CardContent>
                    <span className="text-5xl mb-4 block">⚠️</span>
                    <p className="text-2xl font-bold">Subject not found</p>
                </CardContent>
            </Card>
        );
    }

    const units = getUnits();

    return (
        <div className="material-viewer max-w-7xl mx-auto p-4 md:p-8 space-y-8 relative z-10 w-full font-outfit">
            {/* Subject Header */}
            <Card className="glass-panel border-0 p-8 md:p-12 rounded-[2rem] relative overflow-hidden text-center md:text-left bg-transparent shadow-none">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 pointer-events-none" />
                <div className="relative z-10">
                    <span className="inline-block bg-white/10 border border-white/20 text-white font-mono rounded-xl px-4 py-1.5 text-sm md:text-base mb-6">{subject.subjectCode}</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">{subject.subjectName}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-gray-300 font-semibold text-sm md:text-base">
                        <span className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">{subject.branch}</span>
                        <span className="text-gray-500">•</span>
                        <span className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">Semester {subject.semester}</span>
                        <span className="text-gray-500">•</span>
                        <span className="bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">{subject.credits} Credits</span>
                    </div>
                </div>
                <BorderBeam size={250} duration={12} delay={0} colorFrom="#8b5cf6" colorTo="#3b82f6" />
            </Card>

            {/* Unit Selector */}
            {units.length > 0 && (
                <div className="flex flex-wrap gap-3 my-8">
                    <Button
                        variant={!selectedUnit ? "default" : "outline"}
                        className={`px-6 py-6 rounded-2xl font-bold transition-all text-base ${!selectedUnit ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 border-0' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10'}`}
                        onClick={() => setSelectedUnit(null)}
                    >
                        All Units
                    </Button>
                    {units.map(unit => (
                        <Button
                            key={unit}
                            variant={selectedUnit === unit ? "default" : "outline"}
                            className={`px-6 py-6 rounded-2xl font-bold transition-all text-base ${selectedUnit === unit ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 border-0' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border-white/10'}`}
                            onClick={() => setSelectedUnit(unit)}
                        >
                            Unit {unit}
                        </Button>
                    ))}
                </div>
            )}

            {/* Tabs & Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex w-full overflow-x-auto gap-2 p-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 hide-scrollbar h-auto justify-start sticky top-0 z-20">
                    <TabsTrigger value="notes" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">📄 Notes ({notes.length})</TabsTrigger>
                    <TabsTrigger value="syllabus" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">📋 Syllabus ({syllabusFiles.length + syllabusData.length})</TabsTrigger>
                    <TabsTrigger value="paper" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">📰 Papers ({papers.length})</TabsTrigger>
                    <TabsTrigger value="books" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">📚 Books ({books.length})</TabsTrigger>
                    <TabsTrigger value="videos" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">🎥 Videos ({videos.length})</TabsTrigger>
                    <TabsTrigger value="labs" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">🧪 Labs ({labs.length})</TabsTrigger>
                    <TabsTrigger value="imp" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">💎 IMP ({imps.length})</TabsTrigger>
                    <TabsTrigger value="ppt" className="whitespace-nowrap flex-1 px-6 py-3.5 rounded-xl font-bold transition-all data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-gray-400">📊 PPT ({ppts.length})</TabsTrigger>
                </TabsList>

                {/* Content Sections */}
                <TabsContent value="notes" className="mt-8 outline-none focus:ring-0">
                    <MaterialGrid items={filterByUnit(notes)} openPreview={openPreview} colorFrom="#4f46e5" colorTo="#c026d3" emptyMsg="No notes available yet." />
                </TabsContent>

                <TabsContent value="syllabus" className="mt-8 outline-none">
                    <div className="space-y-8">
                        {syllabusFiles.length > 0 && <MaterialGrid items={syllabusFiles} openPreview={openPreview} colorFrom="#ec4899" colorTo="#8b5cf6" title="Official Syllabus Files" />}
                        <div className="grid grid-cols-1 gap-6">
                            {syllabusData.map(unit => (
                                <Card key={unit._id} className="glass-panel group border-0 rounded-3xl relative overflow-hidden bg-transparent shadow-none">
                                    <ViewSyllabusUnit unit={unit} />
                                    <BorderBeam size={200} duration={14} className="opacity-0 group-hover:opacity-100 transition-opacity" colorFrom="#f43f5e" colorTo="#8b5cf6" />
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="paper" className="mt-8 outline-none">
                    <MaterialGrid items={papers} openPreview={openPreview} colorFrom="#ef4444" colorTo="#f59e0b" emptyMsg="No past papers available yet." />
                </TabsContent>

                <TabsContent value="books" className="mt-8 outline-none">
                    <MaterialGrid items={books} openPreview={openPreview} colorFrom="#10b981" colorTo="#3b82f6" emptyMsg="No textbooks available yet." />
                </TabsContent>

                <TabsContent value="videos" className="mt-8 outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.length === 0 ? (
                            <p className="col-span-full text-center py-12 text-gray-400 font-medium text-lg bg-white/5 rounded-3xl border border-white/10">No videos available yet.</p>
                        ) : (
                            videos.map(video => <VideoCard key={video._id} video={video} />)
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="labs" className="mt-8 outline-none">
                    <MaterialGrid items={filterByUnit(labs)} openPreview={openPreview} colorFrom="#06b6d4" colorTo="#3b82f6" emptyMsg="No lab manuals available yet." />
                </TabsContent>

                <TabsContent value="imp" className="mt-8 outline-none">
                    <MaterialGrid items={filterByUnit(imps)} openPreview={openPreview} colorFrom="#f59e0b" colorTo="#ef4444" emptyMsg="No IMP questions available yet." />
                </TabsContent>

                <TabsContent value="ppt" className="mt-8 outline-none">
                    <MaterialGrid items={filterByUnit(ppts)} openPreview={openPreview} colorFrom="#8b5cf6" colorTo="#d946ef" emptyMsg="No presentations available yet." />
                </TabsContent>
            </Tabs>

            {/* Preview Modal */}
            <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
                <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 bg-[#0f0f14]/95 backdrop-blur-3xl border-white/10 overflow-hidden rounded-3xl shadow-2xl">
                    <DialogHeader className="p-6 border-b border-white/10 bg-black/40">
                        <DialogTitle className="text-white text-2xl font-bold">Document Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 h-full w-full bg-black/90">
                        {previewUrl && (
                            <iframe src={previewUrl} title="Document Preview" className="w-full h-[calc(90vh-180px)] border-none bg-transparent" />
                        )}
                    </div>
                    <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end">
                        <Button asChild variant="outline" className="bg-white/5 hover:bg-white/10 text-white border-white/10 py-5 px-6 rounded-xl font-semibold text-base transition-colors">
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer">Open in New Tab</a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const MaterialGrid = ({ items, openPreview, colorFrom, colorTo, emptyMsg, title }) => (
    <div className="space-y-6">
        {title && <h2 className="text-2xl font-bold text-white mb-4 ml-2">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
                <p className="col-span-full text-center py-12 text-gray-400 font-medium text-lg bg-white/5 rounded-3xl border border-white/10">{emptyMsg}</p>
            ) : (
                items.map(item => (
                    <UnifiedMaterialCard key={item._id} item={item} openPreview={openPreview} colorFrom={colorFrom} colorTo={colorTo} />
                ))
            )}
        </div>
    </div>
);

const ViewSyllabusUnit = ({ unit }) => (
    <CardContent className="p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-white">{unit.unitTitle || `Unit ${unit.unitNumber}`}</h3>
            {unit.unitNumber && <span className="bg-rose-500/20 text-rose-300 px-4 py-1.5 rounded-xl font-bold border border-rose-500/30 whitespace-nowrap">Unit {unit.unitNumber}</span>}
        </div>
        <div className="relative z-10 text-gray-300 text-lg leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">
            {unit.content && <p className="whitespace-pre-wrap">{unit.content}</p>}
        </div>
    </CardContent>
);

const UnifiedMaterialCard = ({ item, openPreview, colorFrom, colorTo }) => (
    <Card className="glass-panel group border-0 rounded-3xl relative overflow-hidden bg-transparent shadow-none min-h-[220px]">
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="relative z-10 mb-6">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors uppercase tracking-tight">{item.title}</h3>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {item.unit && <span className="bg-white/5 text-gray-300 px-3 py-1 rounded-lg text-sm font-bold border border-white/10">U{item.unit}</span>}
                        {item.source && (
                            <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md text-[10px] font-bold border border-indigo-500/20 uppercase tracking-tighter">
                                {item.source.split('.')[0]}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="relative z-10 flex flex-col gap-4 mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorFrom }} />
                    <div className="text-xs font-bold text-gray-300 uppercase tracking-widest">{item.materialType}</div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => openPreview(item.content)} className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-base border-0">Preview</Button>
                    <Button asChild variant="outline" className="flex-1 py-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border-white/10 text-base">
                        <a href={item.content} target="_blank" rel="noopener noreferrer">Download ↗</a>
                    </Button>
                </div>
            </div>
            <BorderBeam size={150} duration={8} delay={Math.random()} className="opacity-0 group-hover:opacity-100 transition-opacity" colorFrom={colorFrom} colorTo={colorTo} />
        </CardContent>
    </Card>
);

const VideoCard = ({ video }) => (
    <Card className="glass-panel group border-0 rounded-3xl relative overflow-hidden bg-transparent shadow-none min-h-[200px]">
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="relative z-10 mb-4">
                <div className="aspect-video w-full rounded-2xl bg-black/40 mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform border border-white/10 shadow-2xl">
                    <img
                        src={`https://img.youtube.com/vi/${new URL(video.content).searchParams.get('v')}/mqdefault.jpg`}
                        alt="Thumbnail"
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <span className="material-icons text-3xl">play_arrow</span>
                        </div>
                    </div>
                </div>
                <h4 className="font-bold text-white text-lg line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                    {video.title}
                </h4>
            </div>
            <Button asChild className="relative z-10 w-full bg-red-600/10 hover:bg-red-600 text-white rounded-xl py-6 font-bold transition-all border border-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] text-base">
                <a href={video.content} target="_blank" rel="noopener noreferrer">Watch Tutorial ↗</a>
            </Button>
            <BorderBeam size={200} duration={10} colorFrom="#ef4444" colorTo="#c026d3" className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
    </Card>
);

export default MaterialViewer;
