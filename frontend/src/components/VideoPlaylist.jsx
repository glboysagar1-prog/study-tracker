import React, { useState, useEffect } from 'react';

import { API_BASE_URL } from '../config/api';

const VideoPlaylist = ({ subjectCode }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/video-playlists/${subjectCode}`);
                const data = await response.json();
                if (data.playlists) {
                    setPlaylists(data.playlists);
                }
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoading(false);
            }
        };

        if (subjectCode) {
            fetchPlaylists();
        }
    }, [subjectCode]);

    if (loading) return <div>Loading videos...</div>;

    if (playlists.length === 0) {
        return <div className="text-center text-gray-500 py-8">No video lectures found for this subject.</div>;
    }

    return (
        <div className="space-y-8">
            {playlists.map((playlist) => (
                <div key={playlist.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-800">{playlist.playlist_name}</h3>
                        <p className="text-sm text-gray-600">By {playlist.channel_name} • {playlist.total_videos} videos</p>
                    </div>
                    <div className="aspect-w-16 aspect-h-9">
                        {/* Extract Playlist ID from URL if possible, or use embed URL directly */}
                        {/* Assuming youtube_playlist_url is full URL, we need to extract ID or use embed format */}
                        {/* Simple heuristic: if it contains 'list=', extract it */}
                        {playlist.youtube_playlist_url && (
                            <iframe
                                className="w-full h-96"
                                src={`https://www.youtube.com/embed/videoseries?list=${playlist.youtube_playlist_url.split('list=')[1]}`}
                                title={playlist.playlist_name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 text-right">
                        <a
                            href={playlist.youtube_playlist_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                            Open in YouTube ↗
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VideoPlaylist;
