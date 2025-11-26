import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MaterialCard from './MaterialCard';
import VideoPlaylist from './VideoPlaylist';
import LabPrograms from './LabPrograms';
import ImportantQuestionsList from './ImportantQuestionsList';

import SyllabusViewer from './SyllabusViewer';

import { API_BASE_URL } from '../config/api';

const SubjectLibrary = () => {
    const { subjectId } = useParams();
    const [activeTab, setActiveTab] = useState('syllabus');
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [materials, setMaterials] = useState([]);

    // Fetch subject details
    useEffect(() => {
        const fetchSubject = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/subjects`);
                const data = await response.json();
                const currentSubject = data.subjects.find(s => s.id === parseInt(subjectId));
                setSubject(currentSubject);
            } catch (error) {
                console.error("Error fetching subject:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubject();
    }, [subjectId]);

    // Fetch materials when tab changes (for notes/books)
    useEffect(() => {
        const fetchMaterials = async () => {
            if (!subject || !subject.subject_code) return;

            if (['notes', 'book', 'ppt'].includes(activeTab)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/study-materials/advanced/${subject.subject_code}?type=${activeTab}`);
                    const data = await response.json();
                    if (data.materials) {
                        setMaterials(data.materials);
                    }
                } catch (error) {
                    console.error("Error fetching materials:", error);
                }
            }
        };

        fetchMaterials();
    }, [activeTab, subject]);

    const handleDownload = (material) => {
        if (material.file_url) {
            window.open(material.file_url, '_blank');
        } else {
            alert("File URL not available");
        }
    };

    const handleBookmark = async (materialId) => {
        // Mock user ID for now
        const userId = "00000000-0000-0000-0000-000000000000";
        try {
            await fetch(`${API_BASE_URL}/api/bookmarks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, material_id: materialId })
            });
            alert("Bookmarked!");
        } catch (error) {
            console.error("Bookmark failed", error);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!subject) return <div className="min-h-screen flex items-center justify-center">Subject not found</div>;

    const tabs = [
        { id: 'syllabus', label: '📑 Detailed Syllabus' },
        { id: 'notes', label: '📝 Notes' },
        { id: 'book', label: '📚 Books' },
        { id: 'video', label: '🎥 Videos' },
        { id: 'lab', label: '💻 Labs' },
        { id: 'important', label: '❓ Important Qs' },
        { id: 'ppt', label: '📊 PPTs' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Link to="/subjects" className="hover:text-blue-600">Subjects</Link>
                        <span className="mx-2">›</span>
                        <span>{subject.subject_name}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{subject.subject_name}</h1>
                    <p className="text-gray-600 mt-1">{subject.subject_code} • Semester {subject.semester}</p>
                </div>

                {/* Tabs */}
                <div className="container mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar space-x-6">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                {activeTab === 'syllabus' && <SyllabusViewer subjectCode={subject.subject_code} />}

                {['notes', 'book', 'ppt'].includes(activeTab) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.length > 0 ? (
                            materials.map(m => (
                                <MaterialCard
                                    key={m.id}
                                    material={m}
                                    onDownload={handleDownload}
                                    onBookmark={handleBookmark}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                No materials found for this category.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'video' && <VideoPlaylist subjectCode={subject.subject_code} />}

                {activeTab === 'lab' && <LabPrograms subjectCode={subject.subject_code} />}

                {activeTab === 'important' && <ImportantQuestionsList subjectCode={subject.subject_code} />}
            </div>
        </div>
    );
};

export default SubjectLibrary;
