import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MaterialCard from './MaterialCard';
import VideoPlaylist from './VideoPlaylist';
import LabPrograms from './LabPrograms';
import ImportantQuestionsList from './ImportantQuestionsList';

import SyllabusViewer from './SyllabusViewer';

import { API_BASE_URL } from '../config/api';

const SubjectLibrary = () => {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('syllabus');
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [materials, setMaterials] = useState([]);

    // Fetch subject details
    useEffect(() => {
        const fetchSubject = async () => {
            try {
                setLoading(true);
                setError(null);

                // Validate subjectId
                console.log("Subject ID from useParams:", subjectId);
                console.log("Type of subjectId:", typeof subjectId);

                if (!subjectId) {
                    setError("No subject ID provided");
                    setLoading(false);
                    return;
                }

                // Check if subjectId is a valid number
                const numericSubjectId = parseInt(subjectId, 10);
                console.log("Parsed numericSubjectId:", numericSubjectId);
                console.log("Is NaN:", isNaN(numericSubjectId));

                if (isNaN(numericSubjectId)) {
                    setError(`Invalid subject ID: ${subjectId}`);
                    setLoading(false);
                    return;
                }

                console.log(`Fetching subject with ID: ${numericSubjectId}`);

                // Fetch specific subject by ID instead of fetching all and filtering
                const response = await fetch(`${API_BASE_URL}/subjects/${numericSubjectId}`);

                // Check if response is OK
                console.log("Response status:", response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`HTTP error! status: ${response.status}`, errorText);
                    if (response.status === 404) {
                        setError(`Subject with ID ${numericSubjectId} not found in database`);
                    } else {
                        setError(`HTTP error! status: ${response.status}`);
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                console.log("Subject data received:", data);

                if (data.subject) {
                    setSubject(data.subject);
                } else if (data.error) {
                    setError(data.error);
                } else {
                    setError("Subject not found in response data");
                }
            } catch (error) {
                console.error("Error fetching subject:", error);
                setError(`Failed to load subject: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        console.log("useEffect triggered with subjectId:", subjectId);
        if (subjectId) {
            fetchSubject();
        } else {
            setLoading(false);
            setError("No subject ID provided in URL");
        }
    }, [subjectId]);

    // Fetch materials when tab changes (for notes/books)
    useEffect(() => {
        const fetchMaterials = async () => {
            if (!subject || !subject.subject_code) return;

            if (['book', 'ppt'].includes(activeTab)) {
                try {
                    const response = await fetch(`${API_BASE_URL}/study-materials/advanced/${subject.subject_code}?type=${activeTab}`);
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
            await fetch(`${API_BASE_URL}/bookmarks`, {
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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl">
                    <div className="flex items-center mb-4">
                        <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-2xl font-bold text-gray-800">Error Loading Subject</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-gray-500 text-sm mb-4">Subject ID: {subjectId}</p>
                    <p className="text-gray-500 text-sm">API Base URL: {API_BASE_URL}</p>
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={() => navigate('/subjects')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            ← Back to Subjects
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!subject) return <div className="min-h-screen flex items-center justify-center">Subject not found</div>;

    const tabs = [
        { id: 'syllabus', label: '📑 Detailed Syllabus' },
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

                {['book', 'ppt'].includes(activeTab) && (
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