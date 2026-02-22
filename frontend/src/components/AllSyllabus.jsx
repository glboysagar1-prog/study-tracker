import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const AllSyllabus = () => {
    const subjects = useQuery(api.subjects.list, {}) ?? [];
    const loading = subjects === undefined;

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>Syllabus</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>View complete syllabus for all subjects</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>Loading subjects...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {subjects.map((subject) => (
                        <Link key={subject._id} to={`/syllabus/${subject._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                                <div style={{ height: '120px', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px' }}>📖</div>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>{subject.subjectName}</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{subject.subjectCode} • Semester {subject.semester}</p>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                    <span className="material-icons" style={{ fontSize: '16px' }}>menu_book</span>
                                    <span>View Syllabus</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllSyllabus;
