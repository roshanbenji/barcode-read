import { X } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import QuaggaScanner from './QuaggaScanner';
import NativeScanner from './NativeScanner';

interface ScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
    onManualEntry?: () => void;
}

const Scanner = ({ onScanSuccess, onClose, onManualEntry }: ScannerProps) => {
    const { scannerType } = useScanner();

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col justify-center items-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-md px-4 relative flex flex-col items-center">
                <h2 className="text-white text-center mb-4 font-medium text-lg">Scan Book Barcode</h2>

                <div className="relative w-full aspect-square max-w-[300px] overflow-hidden rounded-lg shadow-xl border-2 border-primary/50 bg-black">
                    {scannerType === 'quagga' ? (
                        <QuaggaScanner onDetected={onScanSuccess} />
                    ) : (
                        <NativeScanner onDetected={onScanSuccess} />
                    )}

                    {/* Scanning overlay/guide */}
                    <div className="absolute inset-0 border-2 border-white/30 m-8 rounded pointer-events-none"></div>

                </div>

                <p className="text-white text-center mt-6 text-sm">
                    Using {scannerType === 'quagga' ? 'Standard' : 'Native'} Scanner
                </p>
                <p className="text-gray-400 text-center mt-1 text-xs">
                    Point your camera at the ISBN barcode.
                </p>

                {onManualEntry && (
                    <button
                        onClick={onManualEntry}
                        className="mt-5 bg-white/15 backdrop-blur-sm text-white px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-white/25 transition-all active:scale-95 border border-white/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M6 16h12" />
                        </svg>
                        Enter ISBN / Add Manually
                    </button>
                )}
            </div>
        </div>
    );
};

export default Scanner;
