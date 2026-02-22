import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const VideoPlaylist = ({ subjectCode }) => {
    const playlists = useQuery(api.studyMaterials.getBySubjectCode,
        subjectCode ? { subjectCode, materialType: 'video' } : "skip"
    ) ?? [];
    const loading = playlists === undefined;

    if (loading) return <div>Loading videos...</div>;

    if (playlists.length === 0) {
        return <div className="text-center text-gray-500 py-8">No video lectures found for this subject.</div>;
    }

    return (
        <div className="space-y-8">
            {playlists.map((playlist) => (
                <div key={playlist._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800">{playlist.title}</h3>
                        <p className="text-sm text-gray-600">{playlist.content ? 'YouTube Playlist' : ''}</p>
                    </div>
                    <div className="aspect-w-16 aspect-h-9">
                        {playlist.content && playlist.content.includes('list=') && (
                            <iframe
                                className="w-full h-96"
                                src={`https://www.youtube.com/embed/videoseries?list=${playlist.content.split('list=')[1]}`}
                                title={playlist.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 text-right">
                        {playlist.content && (
                            <a href={playlist.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                Open in YouTube ↗
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoPlaylist;
