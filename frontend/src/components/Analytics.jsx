import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5004';

const Analytics = () => {
    const [analytics, setAnalytics] = useState({
        totalStudyTime: 0,
        topicsCompleted: 42,
        testsCompleted: 12,
        averageScore: 85,
        streak: 7,
        weeklyProgress: [],
        subjectProgress: []
    });

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px' }}>
                    Analytics & Progress
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    Track your learning journey and performance metrics
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>
                                {analytics.topicsCompleted}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Topics Completed
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ddd6fe, #e9d5ff)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            📚
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: '#d1fae5', color: 'var(--success)' }}>
                        <span>↑</span>
                        <span>+12% this week</span>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--success)', marginBottom: '4px' }}>
                                {analytics.averageScore}%
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Average Score
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            🎯
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: '#d1fae5', color: 'var(--success)' }}>
                        <span>↑</span>
                        <span>+5% improvement</span>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--warning)', marginBottom: '4px' }}>
                                {analytics.testsCompleted}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Tests Completed
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #fed7aa, #fde68a)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            ✅
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: '#d1fae5', color: 'var(--success)' }}>
                        <span>↑</span>
                        <span>3 this week</span>
                    </div>
                </div>

                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--danger)', marginBottom: '4px' }}>
                                {analytics.streak}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                                Day Streak
                            </div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #fecaca, #fca5a5)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                            🔥
                        </div>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', padding: '4px 8px', borderRadius: '6px', background: '#d1fae5', color: 'var(--success)' }}>
                        <span>↑</span>
                        <span>Personal best!</span>
                    </div>
                </div>
            </div>

            {/* Subject Progress */}
            <div className="card" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '20px' }}>
                    Subject Progress
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                        { name: 'Operating System', progress: 70, topics: '28/40' },
                        { name: 'Database Management', progress: 55, topics: '22/40' },
                        { name: 'Data Structures', progress: 85, topics: '34/40' },
                        { name: 'Computer Networks', progress: 45, topics: '18/40' },
                        { name: 'Python Programming', progress: 92, topics: '37/40' },
                    ].map((subject, index) => (
                        <div key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
                                    {subject.name}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {subject.topics} topics • {subject.progress}%
                                </span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${subject.progress}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '20px' }}>
                    Quick Actions
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    <Link to="/subjects" style={{ textDecoration: 'none' }}>
                        <div className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📚 View Subjects</span>
                        </div>
                    </Link>
                    <Link to="/subjects" style={{ textDecoration: 'none' }}>
                        <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>📝 Take Test</span>
                        </div>
                    </Link>
                    <Link to="/ai-assistant" style={{ textDecoration: 'none' }}>
                        <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                            <span>🤖 AI Assistant</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
