import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import VideoPlaylist from './VideoPlaylist';

const AllVideoTutorials = () => {
    const subjects = useQuery(api.subjects.list, {}) ?? [];
    const loading = subjects === undefined;
    const [selectedSubject, setSelectedSubject] = useState(null);

    if (selectedSubject) {
        return (
            <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
                <button onClick={() => setSelectedSubject(null)} className="btn btn-secondary" style={{ marginBottom: '24px' }}>
                    <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
                    <span>Back to All Subjects</span>
                </button>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
                    {selectedSubject.subjectName} - Video Tutorials
                </h2>
                <VideoPlaylist subjectCode={selectedSubject.subjectCode} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>Video Tutorials</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Watch video lectures and tutorials for all subjects</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>Loading subjects...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {subjects.map((subject) => (
                        <div key={subject._id} onClick={() => setSelectedSubject(subject)} className="card" style={{ height: '100%', cursor: 'pointer' }}>
                            <div style={{ height: '120px', background: 'linear-gradient(135deg, #ec4899, #f43f5e)', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', marginBottom: '16px' }}>🎥</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>{subject.subjectName}</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{subject.subjectCode} • Semester {subject.semester}</p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                                <span className="material-icons" style={{ fontSize: '16px' }}>play_circle</span>
                                <span>Watch Videos</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllVideoTutorials;
