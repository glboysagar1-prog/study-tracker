import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import './SubjectBrowser.css';
import { BorderBeam } from './ui/BorderBeam';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const SubjectBrowser = () => {
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const metadata = useQuery(api.subjects.getMetadata) ?? { courses: [], branches: [], semesters: [] };
    const subjects = useQuery(api.subjects.list, {
        branch: selectedBranch || undefined,
        semester: selectedSemester || undefined,
    }) ?? [];

    const handleSubjectClick = (subjectCode) => {
        window.location.href = `/materials/${subjectCode}`;
    };

    // Group subjects by semester
    const groupedSubjects = subjects.reduce((acc, subject) => {
        const sem = subject.semester;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(subject);
        return acc;
    }, {});

    // Sort semesters numerically
    const sortedSemesters = Object.keys(groupedSubjects).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
        return a.localeCompare(b);
    });

    return (
        <div className="subject-browser relative z-10 w-full">
            <div className="browser-header">
                <h1>Browse GTU Study Materials</h1>
                <p>Select your branch and semester to find strictly organized subjects and resources</p>
            </div>

            <Card className="filters glass-panel border-0 p-6 rounded-3xl mb-12 shadow-none bg-transparent">
                <CardContent className="flex flex-col md:flex-row gap-6 p-0">
                    <div className="filter-group flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Branch</label>
                        <Select
                            value={selectedBranch === "" ? "all" : selectedBranch}
                            onValueChange={(val) => setSelectedBranch(val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="w-full p-3.5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/40 text-white backdrop-blur-xl h-14">
                                <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                                <SelectItem value="all">All Branches</SelectItem>
                                {metadata.branches.map((branch) => (
                                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="filter-group flex-1">
                        <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">Semester</label>
                        <Select
                            value={selectedSemester === "" ? "all" : selectedSemester}
                            onValueChange={(val) => setSelectedSemester(val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="w-full p-3.5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-black/40 text-white backdrop-blur-xl h-14">
                                <SelectValue placeholder="All Semesters" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a2e] border-white/10 text-white">
                                <SelectItem value="all">All Semesters</SelectItem>
                                {metadata.semesters.map((semester) => (
                                    <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {subjects.length === 0 ? (
                <Card className="no-subjects glass-panel border-0 p-12 rounded-3xl mt-8 shadow-none bg-transparent backdrop-blur-md">
                    <CardContent className="p-0">
                        <p className="text-gray-300 text-xl font-medium">No subjects found. Try adjusting your filters.</p>
                    </CardContent>
                </Card>
            ) : (
                sortedSemesters.map(semester => (
                    <div key={semester} className="semester-group">
                        <h2 className="semester-heading text-white mix-blend-plus-lighter">Semester {semester}</h2>
                        <div className="subjects-grid">
                            {groupedSubjects[semester].map((subject) => (
                                <Card
                                    key={subject._id}
                                    className="subject-card glass-panel group overflow-hidden relative cursor-pointer border-0 shadow-none bg-transparent"
                                    onClick={() => handleSubjectClick(subject.subjectCode)}
                                >
                                    <CardContent className="relative z-10 flex flex-col h-full bg-transparent p-6 pb-6 pt-6 px-6">
                                        <div className="subject-code bg-white/5 border border-white/10 text-white font-mono rounded-lg px-2 py-1 absolute top-4 right-4">{subject.subjectCode}</div>
                                        <h3 className="subject-name text-white font-bold text-xl mt-8 mb-2 leading-snug pr-8">{subject.subjectName}</h3>
                                        <div className="subject-meta text-gray-400 font-medium">
                                            <span className="meta-item flex items-center gap-1.5">
                                                <i className="icon opacity-80">📚</i>
                                                {subject.credits} Credits
                                            </span>
                                        </div>
                                        <div className="subject-branch text-indigo-400 font-semibold text-sm mt-auto pt-6 tracking-wide uppercase">{subject.branch}</div>
                                        <BorderBeam size={150} duration={8} delay={Math.random() * 2} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" colorFrom="#6366f1" colorTo="#ec4899" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SubjectBrowser;
