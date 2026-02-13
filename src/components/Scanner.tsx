import { X } from 'lucide-react';
import { useScanner } from '../context/ScannerContext';
import QuaggaScanner from './QuaggaScanner';
import NativeScanner from './NativeScanner';

interface ScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

const Scanner = ({ onScanSuccess, onClose }: ScannerProps) => {
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
            </div>
        </div>
    );
};

export default Scanner;
