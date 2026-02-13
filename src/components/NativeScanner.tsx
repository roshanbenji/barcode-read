import React, { useEffect, useRef, useState } from 'react';

import { useScanner } from '../context/ScannerContext';

interface NativeScannerProps {
    onDetected: (code: string) => void;
}

const NativeScanner: React.FC<NativeScannerProps> = ({ onDetected }) => {
    const { cameraDeviceId } = useScanner();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let active = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let barcodeDetector: any = null;
        let animationFrameId: number;

        const startScanner = async () => {
            if (!('BarcodeDetector' in window)) {
                setError("Native Barcode Detector is not supported in this browser.");
                return;
            }

            try {
                // @ts-ignore
                const supportedFormats = await window.BarcodeDetector.getSupportedFormats();

                // Filter for EAN-13 and EAN-8 specifically as requested
                const formatsToUse = supportedFormats.filter((f: string) => f === 'ean_13' || f === 'ean_8');

                if (formatsToUse.length === 0) {
                    setError("This device does not support EAN-13 barcode detection natively.");
                    return;
                }

                // @ts-ignore
                barcodeDetector = new window.BarcodeDetector({
                    formats: formatsToUse
                });

                const constraints: MediaStreamConstraints = {
                    video: {
                        facingMode: cameraDeviceId ? undefined : 'environment',
                        deviceId: cameraDeviceId ? { exact: cameraDeviceId } : undefined,
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    }
                };

                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                // Apply advanced constraints if supported
                const track = mediaStream.getVideoTracks()[0];
                if (track) {
                    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
                    const advancedConstraints: any = { advanced: [] };

                    // @ts-ignore
                    if (capabilities.focusMode && capabilities.focusMode.includes('continuous')) {
                        advancedConstraints.advanced.push({ focusMode: 'continuous' });
                    }

                    // @ts-ignore
                    if (capabilities.zoom) {
                        // Optional: slight zoom to help with focus on macro
                        // constraints.advanced.push({ zoom: 1.5 });
                    }

                    if (advancedConstraints.advanced.length > 0) {
                        try {
                            await track.applyConstraints(advancedConstraints);
                        } catch (e) {
                            console.warn("Failed to apply advanced camera constraints", e);
                        }
                    }
                }

                if (active) {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                        videoRef.current.play().catch(e => console.error("Video play failed", e));
                    }
                } else {
                    mediaStream.getTracks().forEach(track => track.stop());
                }

                const detectLoop = async () => {
                    if (!active || !videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

                    try {
                        const barcodes = await barcodeDetector.detect(videoRef.current);

                        // Draw boxes
                        const canvas = canvasRef.current;
                        const video = videoRef.current;

                        if (canvas && video) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                // Match canvas size to client size (display size)
                                if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
                                    canvas.width = canvas.clientWidth;
                                    canvas.height = canvas.clientHeight;
                                }

                                ctx.clearRect(0, 0, canvas.width, canvas.height);

                                // Calculate scaling to match object-cover
                                const videoRatio = video.videoWidth / video.videoHeight;
                                const canvasRatio = canvas.width / canvas.height;

                                let scale, offsetX, offsetY;

                                if (canvasRatio > videoRatio) {
                                    // Canvas is wider than video (video cropped top/bottom) - actually video fills width, crops height?
                                    // object-cover: image is sized to maintain aspect ratio while filling element

                                    // If canvas is wider (e.g. 16:9) and video is taller (e.g. 4:3) -> video fills width, crops height? 
                                    // Wait, if canvasRatio (1.77) > videoRatio (1.33), the video must be scaled up to match width? 
                                    // No, object-cover means "cover the container". 
                                    // If container is WIDER than video, video is scaled to match WIDTH, and HEIGHT is cropped.
                                    // If container is TALLER than video, video is scaled to match HEIGHT, and WIDTH is cropped.

                                    scale = canvas.width / video.videoWidth;
                                    // But check if that scale covers the height
                                    if (video.videoHeight * scale < canvas.height) {
                                        // Not enough height, so we must scale by height instead
                                        scale = canvas.height / video.videoHeight;
                                    }
                                } else {
                                    // Canvas is taller/narrower.
                                    scale = canvas.height / video.videoHeight;
                                    if (video.videoWidth * scale < canvas.width) {
                                        scale = canvas.width / video.videoWidth;
                                    }
                                }

                                const scaledWidth = video.videoWidth * scale;
                                const scaledHeight = video.videoHeight * scale;

                                offsetX = (canvas.width - scaledWidth) / 2;
                                offsetY = (canvas.height - scaledHeight) / 2;

                                if (barcodes.length > 0) {
                                    barcodes.forEach((barcode: any) => {
                                        if (barcode.boundingBox) {
                                            const { x, y, width, height } = barcode.boundingBox;

                                            const drawX = x * scale + offsetX;
                                            const drawY = y * scale + offsetY;
                                            const drawW = width * scale;
                                            const drawH = height * scale;

                                            ctx.beginPath();
                                            ctx.lineWidth = 3;
                                            ctx.strokeStyle = '#00FF00'; // Green
                                            ctx.rect(drawX, drawY, drawW, drawH);
                                            ctx.stroke();
                                        }
                                    });
                                }
                            }
                        }

                        if (barcodes.length > 0) {
                            // Find the first EAN-13 code
                            const ean13 = barcodes.find((b: any) => b.format === 'ean_13');
                            const ean8 = barcodes.find((b: any) => b.format === 'ean_8');

                            const detected = ean13 || ean8 || barcodes[0];

                            if (detected && detected.rawValue) {
                                // console.log("Native Scanner Detected:", detected.rawValue, detected.format);
                                onDetected(detected.rawValue);
                                // Optional: simple vibration feedback
                                if (navigator.vibrate) navigator.vibrate(200);
                            }
                        }
                    } catch (e) {
                        // Detection error, can be ignored often
                        // console.debug("Detection error", e);
                    }

                    if (active) {
                        animationFrameId = requestAnimationFrame(detectLoop);
                    }
                };

                // Start detection loop once video is ready
                if (videoRef.current) {
                    videoRef.current.onloadeddata = () => {
                        detectLoop();
                    };
                }

            } catch (err: any) {
                console.error("Native scanner init failed", err);
                if (active) setError(err.message || "Failed to start camera");
            }
        };

        startScanner();

        return () => {
            active = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraDeviceId]); // Restart when camera changes

    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-black text-white p-4 text-center">
                <div className="max-w-xs">
                    <p className="text-red-400 font-medium mb-2">Scanner Error</p>
                    <p className="text-sm text-gray-300">{error}</p>
                    <p className="text-xs text-gray-500 mt-4">Try switching back to Standard Scanner in settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-black">
            <video
                ref={videoRef}
                className="w-full h-full object-cover relative z-10"
                muted
                playsInline
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            />

            {/* <canvas> overlay is here, but text overlay is removed */}
        </div>
    );
};

export default NativeScanner;
