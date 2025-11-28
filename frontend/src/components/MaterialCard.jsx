import React from 'react';

const MaterialCard = ({ material, onDownload }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'video': return '🎥';
            case 'notes': return '📝';
            case 'book': return '📚';
            case 'lab': return '💻';
            case 'ppt': return '📊';
            default: return '📄';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="flex items-start mb-3">
                <div className="text-2xl mr-3">{getIcon(material.material_type)}</div>
                <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-2">{material.title}</h3>
                    {material.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                    {material.views || 0} views • {material.downloads || 0} downloads
                </div>
                <button
                    onClick={() => onDownload(material)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm font-medium"
                >
                    Download
                </button>
            </div>
        </div>
    );
};

export default MaterialCard;