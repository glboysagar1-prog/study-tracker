import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MaterialViewer.css';

import { API_BASE_URL } from '../config/api';

const MaterialViewer = ({ subjectCode }) => {
    const [subject, setSubject] = useState(null);
    const [materials, setMaterials] = useState({
        notes: [],
        questions: [],
        references: [],
        syllabus_content: []
    });
    const [activeTab, setActiveTab] = useState('notes');
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchMaterials();
    }, [subjectCode]);

    const fetchMaterials = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/materials/browse`, {
                params: { subject_code: subjectCode }
            });

            if (response.data.success) {
                setSubject(response.data.subject);
                setMaterials(response.data.materials);
            }
        } catch (err) {
            console.error('Failed to fetch materials:', err);
            setError('Failed to load materials');
        } finally {
            setLoading(false);
        }
    };

    const getUnits = () => {
        const units = new Set();
        materials.notes.forEach(note => note.unit && units.add(note.unit));
        materials.questions.forEach(q => q.unit && units.add(q.unit));
        return Array.from(units).sort((a, b) => a - b);
    };

    const filterByUnit = (items) => {
        if (!selectedUnit) return items;
        return items.filter(item => item.unit === selectedUnit);
    };

    const isNew = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    // Convert Google Drive links to preview-compatible format
    const getPreviewUrl = (url) => {
        if (!url) return null;

        // Check if it's a Google Drive link
        if (url.includes('drive.google.com')) {
            // Extract file ID from various Google Drive URL formats
            let fileId = null;

            // Format: https://drive.google.com/file/d/FILE_ID/view
            const viewMatch = url.match(/\/file\/d\/([^\/]+)/);
            if (viewMatch) {
                fileId = viewMatch[1];
            }

            // Format: https://drive.google.com/open?id=FILE_ID
            const openMatch = url.match(/[?&]id=([^&]+)/);
            if (openMatch) {
                fileId = openMatch[1];
            }

            // If we found a file ID, return preview URL
            if (fileId) {
                return `https://drive.google.com/file/d/${fileId}/preview`;
            }
        }

        // For non-Google Drive links, return as-is
        return url;
    };

    const openPreview = (url) => {
        const previewCompatibleUrl = getPreviewUrl(url);
        setPreviewUrl(previewCompatibleUrl);
    };

    const closePreview = () => {
        setPreviewUrl(null);
    };

    if (loading) {
        return (
            <div className="material-viewer loading">
                <div className="spinner"></div>
                <p>Loading materials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="material-viewer error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
            </div>
        );
    }

    const units = getUnits();

    return (
        <div className="material-viewer">
            {/* Subject Header */}
            <div className="subject-header">
                <div className="subject-info">
                    <span className="subject-code-badge">{subject?.subject_code}</span>
                    <h1>{subject?.subject_name}</h1>
                    <div className="subject-meta">
                        <span>{subject?.branch}</span>
                        <span>•</span>
                        <span>Semester {subject?.semester}</span>
                        <span>•</span>
                        <span>{subject?.credits} Credits</span>
                    </div>
                </div>
            </div>

            {/* Unit Selector */}
            {units.length > 0 && (
                <div className="unit-selector">
                    <button
                        className={`unit-btn ${!selectedUnit ? 'active' : ''}`}
                        onClick={() => setSelectedUnit(null)}
                    >
                        All Units
                    </button>
                    {units.map(unit => (
                        <button
                            key={unit}
                            className={`unit-btn ${selectedUnit === unit ? 'active' : ''}`}
                            onClick={() => setSelectedUnit(unit)}
                        >
                            Unit {unit}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    📄 Notes ({materials.notes.length})
                </button>
                <button
                    className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questions')}
                >
                    ❓ Important Questions ({materials.questions.length})
                </button>
                <button
                    className={`tab ${activeTab === 'references' ? 'active' : ''}`}
                    onClick={() => setActiveTab('references')}
                >
                    📚 References ({materials.references.length})
                </button>
                <button
                    className={`tab ${activeTab === 'syllabus' ? 'active' : ''}`}
                    onClick={() => setActiveTab('syllabus')}
                >
                    📋 Syllabus ({materials.syllabus_content.length})
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'notes' && (
                    <div className="notes-list">
                        {filterByUnit(materials.notes).length === 0 ? (
                            <p className="empty-state">No notes available yet.</p>
                        ) : (
                            filterByUnit(materials.notes).map(note => (
                                <div key={note.id} className="material-card">
                                    <div className="card-header">
                                        <div className="header-top">
                                            <h3>{note.title}</h3>
                                            {isNew(note.created_at) && <span className="new-badge">NEW</span>}
                                        </div>
                                        {note.unit && <span className="unit-badge">Unit {note.unit}</span>}
                                    </div>
                                    {note.description && <p className="description">{note.description}</p>}
                                    <div className="card-footer">
                                        <div className="source-attribution">
                                            <span>From {note.source_name || 'External Source'}</span>
                                            {note.source_url && (
                                                <a href={note.source_url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                    View Source ↗
                                                </a>
                                            )}
                                        </div>
                                        <div className="action-buttons">
                                            {note.file_url && (
                                                <>
                                                    <a
                                                        href={note.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-primary"
                                                    >
                                                        Open PDF ↗
                                                    </a>
                                                    <button
                                                        onClick={() => openPreview(note.file_url)}
                                                        className="btn-secondary"
                                                    >
                                                        Preview
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'questions' && (
                    <div className="questions-list">
                        {filterByUnit(materials.questions).length === 0 ? (
                            <p className="empty-state">No important questions available yet.</p>
                        ) : (
                            filterByUnit(materials.questions).map(question => (
                                <div key={question.id} className="material-card question-card">
                                    <div className="card-header">
                                        <div className="question-meta">
                                            {question.unit && <span className="unit-badge">Unit {question.unit}</span>}
                                            {question.marks && <span className="marks-badge">{question.marks} Marks</span>}
                                            {question.difficulty && <span className="difficulty-badge">{question.difficulty}</span>}
                                            {isNew(question.created_at) && <span className="new-badge">NEW</span>}
                                        </div>
                                    </div>
                                    <p className="question-text">{question.question_text}</p>
                                    {question.answer_text && (
                                        <details className="answer-section">
                                            <summary>View Answer</summary>
                                            <p>{question.answer_text}</p>
                                        </details>
                                    )}
                                    <div className="card-footer">
                                        <div className="source-attribution">
                                            <span>From {question.source_name || 'External Source'}</span>
                                            {question.source_url && (
                                                <a href={question.source_url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                    Open Source →
                                                </a>
                                            )}
                                        </div>
                                        {question.frequency && question.frequency > 1 && (
                                            <span className="frequency">Asked {question.frequency} times</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'references' && (
                    <div className="references-list">
                        {materials.references.length === 0 ? (
                            <p className="empty-state">No reference materials available yet.</p>
                        ) : (
                            materials.references.map(ref => (
                                <div key={ref.id} className="material-card reference-card">
                                    <div className="card-header">
                                        <div className="header-top">
                                            <h3>{ref.title}</h3>
                                            {isNew(ref.created_at) && <span className="new-badge">NEW</span>}
                                        </div>
                                        <span className="type-badge">{ref.material_type}</span>
                                    </div>
                                    {ref.author && <p className="author">By {ref.author}</p>}
                                    {ref.description && <p className="description">{ref.description}</p>}
                                    {ref.publisher && <p className="meta">Publisher: {ref.publisher}</p>}
                                    {ref.isbn && <p className="meta">ISBN: {ref.isbn}</p>}
                                    <div className="card-footer">
                                        <div className="source-attribution">
                                            <span>From {ref.source_name || 'External Source'}</span>
                                        </div>
                                        {ref.url && (
                                            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="download-btn">
                                                View Resource →
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'syllabus' && (
                    <div className="syllabus-list">
                        {filterByUnit(materials.syllabus_content).length === 0 ? (
                            <p className="empty-state">No syllabus content available yet.</p>
                        ) : (
                            filterByUnit(materials.syllabus_content).map(content => (
                                <div key={content.id} className="material-card syllabus-card">
                                    <div className="card-header">
                                        <h3>{content.unit_title || `Unit ${content.unit}`}</h3>
                                        {content.unit && <span className="unit-badge">Unit {content.unit}</span>}
                                    </div>
                                    {content.topic && <h4 className="topic">{content.topic}</h4>}
                                    {content.content && <p className="content">{content.content}</p>}
                                    {content.source_url && (
                                        <div className="card-footer">
                                            <a href={content.source_url} target="_blank" rel="noopener noreferrer" className="source-link">
                                                View Full Syllabus →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div className="modal-overlay" onClick={closePreview}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Document Preview</h3>
                            <button className="close-btn" onClick={closePreview}>×</button>
                        </div>
                        <div className="modal-body">
                            <iframe
                                src={previewUrl.includes('drive.google.com') ? previewUrl.replace('/view', '/preview') : previewUrl}
                                title="Document Preview"
                                width="100%"
                                height="600px"
                            ></iframe>
                        </div>
                        <div className="modal-footer">
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="download-btn">
                                Open in New Tab
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialViewer;
