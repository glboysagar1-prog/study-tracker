import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LabPrograms from './LabPrograms';

import { API_BASE_URL } from '../config/api';

const AllLabPrograms = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(null);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/subjects`);
            const data = await response.json();
            if (data.subjects) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedSubject) {
        return (
            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                <button
                    onClick={() => setSelectedSubject(null)}
                    className="btn btn-secondary"
                    style={{ marginBottom: '24px' }}
                >
                    <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
                    <span>Back to All Subjects</span>
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
                    {selectedSubject.subject_name} - Lab Programs
                </h2>
                <LabPrograms subjectCode={selectedSubject.subject_code} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>
                    Lab Programs
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Access lab programs and practicals for all subjects
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                    Loading subjects...
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {subjects.map((subject) => (
                        <div
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject)}
                            className="card"
                            style={{ height: '100%', cursor: 'pointer' }}
                        >
                            <div style={{
                                height: '120px',
                                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                borderRadius: '12px 12px 0 0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '48px',
                                marginBottom: '16px'
                            }}>
                                💻
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
                                {subject.subject_name}
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                {subject.subject_code} • Semester {subject.semester}
                            </p>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                color: 'var(--secondary)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600'
                            }}>
                                <span className="material-icons" style={{ fontSize: '16px' }}>code</span>
                                <span>View Programs</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllLabPrograms;
