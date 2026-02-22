import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const MaterialUploadForm = () => {
    const subjects = useQuery(api.subjects.list, {}) ?? [];
    const createMaterial = useMutation(api.studyMaterials.create);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subjectId: '',
        materialType: 'notes',
        title: '',
        content: '',
        unit: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createMaterial({
                subjectId: formData.subjectId,
                title: formData.title,
                content: formData.content,
                materialType: formData.materialType,
                unit: formData.unit ? parseInt(formData.unit) : undefined,
            });

            alert("Material uploaded successfully!");
            setFormData({ subjectId: '', materialType: 'notes', title: '', content: '', unit: '' });
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
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.subjectName} ({s.subjectCode})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material Type</label>
                    <select
                        name="materialType"
                        value={formData.materialType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="notes">📝 Notes</option>
                        <option value="book">📚 Reference Book</option>
                        <option value="ppt">📊 PPT/Slides</option>
                        <option value="summary">📋 Summary</option>
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
                            name="content"
                            value={formData.content}
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
