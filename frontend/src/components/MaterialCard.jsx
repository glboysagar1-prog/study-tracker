import React from 'react';
import RatingSystem from './RatingSystem';

const MaterialCard = ({ material, onDownload, onBookmark }) => {
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
        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300 border border-gray-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center">
                    <div className="text-3xl mr-3">{getIcon(material.material_type)}</div>
                    <div>
                        <h3 className="font-semibold text-lg text-gray-800 line-clamp-1">{material.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{material.description}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <div className="flex flex-col space-y-1">
                    <div className="flex space-x-3">
                        <span>👁️ {material.views || 0}</span>
                        <span>⬇️ {material.downloads || 0}</span>
                    </div>
                    <RatingSystem materialId={material.id} currentRating={material.rating} />
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onBookmark(material.id)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Bookmark"
                    >
                        🔖
                    </button>
                    <button
                        onClick={() => onDownload(material)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialCard;
