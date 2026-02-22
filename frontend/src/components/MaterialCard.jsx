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
        <div className="bg-card glass-panel rounded-xl p-5 hover:shadow-[0_8px_30px_rgba(34,197,94,0.06)] transition-all duration-300 border border-white/10 hover:border-green-500/30 group cursor-pointer hover:-translate-y-1 relative overflow-hidden">
            {/* Subtle glow effect top edge */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-green-500/40 transition-colors duration-500"></div>

            <div className="flex items-start mb-4">
                <div className="text-2xl mr-4 p-3 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 group-hover:bg-green-500/10 transition-all duration-300 shadow-inner">
                    {getIcon(material.material_type)}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white tracking-tight truncate group-hover:text-green-400 transition-colors duration-200">{material.title}</h3>
                    {material.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">{material.description}</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                <div className="text-xs font-mono text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1.5"><span className="material-icons opacity-70 text-[14px]">visibility</span> {material.views || 0}</span>
                    <span className="flex items-center gap-1.5"><span className="material-icons opacity-70 text-[14px]">download</span> {material.downloads || 0}</span>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDownload(material); }}
                    className="bg-white/5 hover:bg-green-500/20 text-slate-300 hover:text-green-400 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border border-white/10 hover:border-green-500/50 shadow-sm flex items-center gap-2 cursor-pointer group/btn"
                >
                    <span className="material-icons text-[16px] group-hover/btn:-translate-y-0.5 transition-transform">file_download</span> Get
                </button>
            </div>
        </div>
    );
};

export default MaterialCard;