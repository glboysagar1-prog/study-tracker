import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../config/api';

const AllImportantQuestions = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/subjects`);
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

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>
                    Important Questions
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Curated list of frequently asked questions
                </p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                    Loading subjects...
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {subjects.map((subject) => (
                        <Link
                            key={subject.id}
                            to={`/important-questions/${subject.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                                <div style={{
                                    height: '120px',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    borderRadius: '12px 12px 0 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '48px',
                                    marginBottom: '16px'
                                }}>
                                    ⭐
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
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: 'var(--danger)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    <span className="material-icons" style={{ fontSize: '16px' }}>star</span>
                                    <span>View Questions</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllImportantQuestions;
