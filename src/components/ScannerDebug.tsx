import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertTriangle, Activity } from 'lucide-react';

interface ScannerDebugProps {
    stream: MediaStream | null;
    errorLog: string[];
    onRestart: () => void;
}

const ScannerDebug: React.FC<ScannerDebugProps> = ({ stream, errorLog, onRestart }) => {
    const [trackSettings, setTrackSettings] = useState<MediaTrackSettings | null>(null);

    useEffect(() => {
        if (!stream) return;

        const updateStats = () => {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                setTrackSettings(videoTrack.getSettings());
            }
        };

        updateStats();
        const interval = setInterval(updateStats, 1000);
        return () => clearInterval(interval);
    }, [stream]);

    // Removed early return to ensure Restart button is always visible
    // if (!stream && errorLog.length === 0) return null;

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-xs font-mono z-50 max-h-[40vh] overflow-y-auto border-t border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold flex items-center gap-2 text-indigo-400">
                    <Activity size={12} /> CAMERA DEBUG
                </h4>
                <button
                    onClick={onRestart}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-[10px] font-bold transition-colors"
                >
                    <RefreshCw size={10} /> RESTART CAM
                </button>
            </div>

            {/* Stream Stats */}
            {trackSettings && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3 text-gray-300">
                    {/* @ts-ignore */}
                    <div>Label: <span className="text-white">{trackSettings.label || 'Unknown'}</span></div>
                    <div>Res: <span className="text-white">{trackSettings.width}x{trackSettings.height}</span></div>
                    <div>FPS: <span className="text-white">{Math.round(trackSettings.frameRate || 0)}</span></div>
                    {/* @ts-ignore */}
                    <div>Focus: <span className="text-white">{trackSettings.focusMode || 'N/A'}</span></div>
                </div>
            )}

            {/* Error Log */}
            {errorLog.length > 0 && (
                <div className="mt-2 border-t border-gray-700 pt-2">
                    <h5 className="font-bold text-red-400 mb-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> RECENT ERRORS
                    </h5>
                    <ul className="space-y-1">
                        {errorLog.slice().reverse().map((err, i) => (
                            <li key={i} className="break-words text-red-200 bg-red-900/20 p-1 rounded">
                                {err}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ScannerDebug;
