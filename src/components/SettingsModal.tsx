import React from 'react';
import { X, Check } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const {
        scannerType,
        setScannerType,
        isNativeSupported,
        availableCameras,
        cameraDeviceId,
        setCameraDeviceId
    } = useScanner();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Scanner Engine</h3>

                        <div className="space-y-2">
                            <button
                                onClick={() => setScannerType('quagga')}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${scannerType === 'quagga'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <div className="text-left">
                                    <div className="font-medium">Standard Scanner</div>
                                    <div className="text-xs opacity-75">QuaggaJS (Reliable, software-based)</div>
                                </div>
                                {scannerType === 'quagga' && <Check size={18} />}
                            </button>

                            <button
                                onClick={() => isNativeSupported && setScannerType('native')}
                                disabled={!isNativeSupported}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${scannerType === 'native'
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : !isNativeSupported
                                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                            >
                                <div className="text-left">
                                    <div className="font-medium">Native Scanner</div>
                                    <div className="text-xs opacity-75">
                                        {isNativeSupported
                                            ? 'Browser Built-in (Faster, Experimental)'
                                            : 'Not supported on this device'}
                                    </div>
                                </div>
                                {scannerType === 'native' && <Check size={18} />}
                            </button>
                        </div>
                    </div>

                    {availableCameras.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Camera Selection</h3>
                            <div className="space-y-2">
                                <select
                                    value={cameraDeviceId || ''}
                                    onChange={(e) => setCameraDeviceId(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">Default Camera (System Choice)</option>
                                    {availableCameras.map((camera) => (
                                        <option key={camera.deviceId} value={camera.deviceId}>
                                            {camera.label || `Camera ${camera.deviceId.slice(0, 5)}...`}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400 px-1">
                                    If scanning is blurry, try selecting a different camera (e.g., "Back Camera", "Ultra Wide").
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 text-center">
                    <button
                        onClick={onClose}
                        className="text-indigo-600 font-medium text-sm hover:underline"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
