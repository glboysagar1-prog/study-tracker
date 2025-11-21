import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubjectBrowser.css';

const API_BASE_URL = 'http://localhost:5004/api';

const SubjectBrowser = () => {
    const [branches, setBranches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch metadata on component mount
    useEffect(() => {
        fetchMetadata();
    }, []);

    // Fetch subjects when filters change
    useEffect(() => {
        if (selectedBranch || selectedSemester) {
            fetchSubjects();
        }
    }, [selectedBranch, selectedSemester]);

    const fetchMetadata = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/subjects/metadata`);
            if (response.data) {
                setBranches(response.data.branches || []);
                setSemesters(response.data.semesters || []);
            }
        } catch (err) {
            console.error('Failed to fetch metadata:', err);
            setError('Failed to load branches and semesters');
        }
    };

    const fetchSubjects = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {};
            if (selectedBranch) params.branch = selectedBranch;
            if (selectedSemester) params.semester = selectedSemester;

            const response = await axios.get(`${API_BASE_URL}/subjects`, { params });
            setSubjects(response.data.subjects || []);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
            setError('Failed to load subjects');
            setSubjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectClick = (subjectCode) => {
        // Navigate to material viewer
        window.location.href = `/materials/${subjectCode}`;
    };

    return (
        <div className="subject-browser">
            <div className="browser-header">
                <h1>Browse Study Materials</h1>
                <p>Select your branch and semester to find subjects</p>
            </div>

            <div className="filters">
                <div className="filter-group">
                    <label htmlFor="branch-select">Branch</label>
                    <select
                        id="branch-select"
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Branches</option>
                        {branches.map((branch) => (
                            <option key={branch} value={branch}>
                                {branch}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label htmlFor="semester-select">Semester</label>
                    <select
                        id="semester-select"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">All Semesters</option>
                        {semesters.map((semester) => (
                            <option key={semester} value={semester}>
                                Semester {semester}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading subjects...</p>
                </div>
            ) : (
                <div className="subjects-grid">
                    {subjects.length === 0 ? (
                        <div className="no-subjects">
                            <p>No subjects found. Try adjusting your filters.</p>
                        </div>
                    ) : (
                        subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="subject-card"
                                onClick={() => handleSubjectClick(subject.subject_code)}
                            >
                                <div className="subject-code">{subject.subject_code}</div>
                                <h3 className="subject-name">{subject.subject_name}</h3>
                                <div className="subject-meta">
                                    <span className="meta-item">
                                        <i className="icon">📚</i>
                                        {subject.credits} Credits
                                    </span>
                                    <span className="meta-item">
                                        <i className="icon">🎓</i>
                                        Sem {subject.semester}
                                    </span>
                                </div>
                                <div className="subject-branch">{subject.branch}</div>
                                <button className="view-materials-btn">View Materials →</button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default SubjectBrowser;
