import React, { useState, useEffect } from 'react';

const MaterialUploadForm = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subject_code: '',
        material_type: 'notes',
        title: '',
        description: '',
        unit: '',
        file_url: '' // In a real app, this would be handled by file upload logic
    });

    useEffect(() => {
        // Fetch subjects for the dropdown
        const fetchSubjects = async () => {
            try {
                const response = await fetch('/api/subjects');
                const data = await response.json();
                if (data.subjects) setSubjects(data.subjects);
            } catch (error) {
                console.error("Error fetching subjects", error);
            }
        };
        fetchSubjects();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mock file upload - in real app, upload to Supabase Storage first
        // Here we assume file_url is entered manually or we just mock it
        const payload = {
            ...formData,
            uploaded_by: "00000000-0000-0000-0000-000000000000" // Mock User ID
        };

        try {
            const response = await fetch('/api/study-materials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Material uploaded successfully!");
                // Reset form
                setFormData({
                    subject_code: '',
                    material_type: 'notes',
                    title: '',
                    description: '',
                    unit: '',
                    file_url: ''
                });
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Study Material</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                        name="subject_code"
                        value={formData.subject_code}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.subject_code}>{s.subject_name} ({s.subject_code})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                    <select
                        name="material_type"
                        value={formData.material_type}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="notes">📝 Notes</option>
                        <option value="book">📚 Reference Book</option>
                        <option value="video">🎥 Video Link</option>
                        <option value="lab">💻 Lab File</option>
                        <option value="ppt">📊 PPT/Slides</option>
                        <option value="important">❓ Important Questions</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md h-24"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Number</label>
                        <input
                            type="number"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">File/Video URL</label>
                        <input
                            type="url"
                            name="file_url"
                            value={formData.file_url}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? 'Uploading...' : 'Upload Material'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaterialUploadForm;
