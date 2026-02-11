import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface ScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
    onClose: () => void;
}

const Scanner = ({ onScanSuccess, onClose }: ScannerProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    // State for error handling removed as it was unused

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
      /* verbose= */ false
        );

        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                onScanSuccess(decodedText);
                scanner.clear(); // Stop scanning after success
            },
            (_) => {
                // Error handling
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col justify-center items-center">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50"
            >
                <X size={24} />
            </button>

            <div className="w-full max-w-md px-4 relative">
                <h2 className="text-white text-center mb-4 font-medium text-lg">Scan Book Barcode</h2>
                <div id="reader" className="overflow-hidden rounded-lg shadow-xl border-2 border-primary/50"></div>
                {/* Error display removed */}
                <p className="text-gray-400 text-center mt-4 text-sm">
                    Point your camera at the ISBN barcode on the back of the book.
                </p>
            </div>
        </div>
    );
};

export default Scanner;
