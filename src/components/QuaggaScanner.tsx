import React, { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';
import { useScanner } from '../context/ScannerContext';

interface QuaggaScannerProps {
    onDetected: (code: string) => void;
}

const QuaggaScanner: React.FC<QuaggaScannerProps> = ({ onDetected }) => {
    const { cameraDeviceId } = useScanner();
    const scannerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!scannerRef.current) return;

        let ignore = false;

        const initQuagga = async () => {
            try {
                await Quagga.init({
                    inputStream: {
                        type: "LiveStream",
                        target: scannerRef.current!,
                        constraints: {
                            width: { min: 640, ideal: 1280, max: 1920 },
                            height: { min: 480, ideal: 720, max: 1080 },
                            facingMode: cameraDeviceId ? undefined : "environment",
                            deviceId: cameraDeviceId ? { exact: cameraDeviceId } : undefined,
                            aspectRatio: { min: 1, max: 2 },
                            // @ts-ignore - focusMode is not in standard types yet but works in some browsers
                            focusMode: "continuous"
                        },
                    },
                    locator: {
                        patchSize: "medium",
                        halfSample: true,
                    },
                    numOfWorkers: 2,
                    decoder: {
                        readers: ["ean_reader"] // Strictly EAN-13 as primary
                    },
                    locate: true,
                }, (err) => {
                    if (err) {
                        console.error("Quagga initialization failed", err);
                        if (!ignore) setError(`Failed to initialize camera: ${err.message || err}`);
                        return;
                    }
                    if (!ignore) {
                        Quagga.start();
                    }
                });

                Quagga.onDetected((result) => {
                    if (result && result.codeResult && result.codeResult.code) {
                        if (navigator.vibrate) navigator.vibrate(200);
                        onDetected(result.codeResult.code);
                    }
                });

            } catch (err: any) {
                console.error("Quagga error:", err);
                if (!ignore) setError(err.message || "Unknown error starting scanner");
            }
        };

        // Small delay to ensure previous streams are closed if re-mounting quickly
        const timeoutId = setTimeout(initQuagga, 100);

        return () => {
            ignore = true;
            clearTimeout(timeoutId);
            Quagga.offDetected();
            Quagga.offProcessed(); // details: Clean up onProcessed
            try {
                Quagga.stop();
            } catch (e) {
                // Ignore stop errors
            }
        };
    }, [onDetected, cameraDeviceId]);

    // Setup onProcessed outside init to avoid closure issues if dependencies change (though here they don't)
    // Actually, it's safer to do it in the effect or just once.
    // We'll add a separate effect or just put it in the init.
    // Let's modify the initQuagga function to include onProcessed.

    useEffect(() => {
        const handleProcessed = (result: any) => {
            const drawingCtx = Quagga.canvas.ctx.overlay;
            const drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (drawingCanvas && drawingCtx) {
                    // Normalize canvas size to match video if needed, mostly Quagga handles this but we ensure cleanup
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width") || "0"), parseInt(drawingCanvas.getAttribute("height") || "0"));

                    if (result.boxes) {
                        result.boxes.filter((box: any) => box !== result.box).forEach((box: any) => {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                    }
                }
            }
        };

        Quagga.onProcessed(handleProcessed);

        return () => {
            Quagga.offProcessed();
        }
    }, []);

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 bg-black text-white p-4 text-center">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <div
                ref={scannerRef}
                className="w-full h-full relative [&>video]:absolute [&>video]:inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:absolute [&>canvas]:inset-0 [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:object-cover"
            />
        </div>
    );
};

export default QuaggaScanner;
