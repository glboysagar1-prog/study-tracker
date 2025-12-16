import React, { useState, useEffect } from 'react';

const MaterialSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        subject: '',
        type: '',
        unit: ''
    });

    useEffect(() => {
        // Fetch subjects for filter
        fetch('/api/subjects')
            .then(res => res.json())
            .then(data => {
                if (data.subjects) setSubjects(data.subjects);
            })
            .catch(err => console.error(err));
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Construct query params
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (filters.subject) params.append('subject', filters.subject);
            if (filters.type) params.append('type', filters.type);
            if (filters.unit) params.append('unit', filters.unit);

            // We need a search endpoint. 
            // Since we don't have a dedicated global search, we might need to add one or reuse existing.
            // Let's assume we add '/api/study-materials/search'
            const response = await fetch(`/api/study-materials/search?${params.toString()}`);
            const data = await response.json();
            if (data.materials) setResults(data.materials);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

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
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                    Search
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.subject_code}>{s.subject_name}</option>)}
                </select>

                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                >
                    <option value="">All Types</option>
                    <option value="video">Videos</option>
                    <option value="book">Books</option>
                    <option value="lab">Lab Files</option>
                </select>

                <input
                    type="number"
                    placeholder="Unit"
                    value={filters.unit}
                    onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                    className="p-2 border border-gray-300 rounded-md"
                />
            </div>

            {/* Results Area */}
            {results.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-700">Results ({results.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map(m => (
                            <div key={m.id} className="border p-4 rounded hover:shadow-md">
                                <div className="font-bold">{m.title}</div>
                                <div className="text-sm text-gray-500">{m.subject_code} • {m.material_type}</div>
                                <a href={m.file_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-2 inline-block">View</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialSearch;
