import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const MaterialSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ subject: '', type: '', unit: '' });
    const subjects = useQuery(api.subjects.list, {}) ?? [];

    // For now, use client-side filtering on all materials
    const allMaterials = useQuery(api.studyMaterials.getBySubject,
        filters.subject ? { subjectId: filters.subject } : "skip"
    ) ?? [];

    const results = allMaterials.filter(m => {
        if (searchQuery && !m.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filters.type && m.materialType !== filters.type) return false;
        if (filters.unit && m.unit !== parseInt(filters.unit)) return false;
        return true;
    });

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Search Materials</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-grow">
                    <input
                        type="text"
                        placeholder="Search notes, books, videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="">Select a Subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>

                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Types</option>
                    <option value="notes">Notes</option>
                    <option value="book">Books</option>
                    <option value="ppt">PPTs</option>
                    <option value="summary">Summaries</option>
                </select>

                <input
                    type="number"
                    placeholder="Unit"
                    value={filters.unit}
                    onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                />
            </div>

            {!filters.subject ? (
                <div className="text-center text-gray-500 py-8">Select a subject to search materials.</div>
            ) : results.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Results ({results.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map(m => (
                            <div key={m._id} className="border p-4 rounded hover:shadow-md">
                                <div className="font-bold">{m.title}</div>
                                <div className="text-sm text-gray-500">{m.materialType} {m.unit ? `• Unit ${m.unit}` : ''}</div>
                                {m.content && (
                                    <a href={m.content} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-2 inline-block">View</a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-500 py-8">No materials found.</div>
            )}
        </div>
    );
};

export default MaterialSearch;
