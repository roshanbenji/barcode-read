import React, { createContext, useContext, useState, useEffect } from 'react';

type ScannerType = 'quagga' | 'native';

interface ScannerContextType {
    scannerType: ScannerType;
    setScannerType: (type: ScannerType) => void;
    isNativeSupported: boolean;
    cameraDeviceId?: string;
    setCameraDeviceId: (id: string) => void;
    availableCameras: MediaDeviceInfo[];
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [scannerType, setScannerTypeState] = useState<ScannerType>(() => {
        const stored = localStorage.getItem('scanner_type');
        return (stored === 'quagga' || stored === 'native') ? stored : 'quagga';
    });

    const [isNativeSupported, setIsNativeSupported] = useState(false);

    useEffect(() => {
        // Check for native BarcodeDetector support
        if ('BarcodeDetector' in window) {
            // @ts-ignore - BarcodeDetector is experimental
            window.BarcodeDetector.getSupportedFormats()
                .then((formats: string[]) => {
                    const supported = formats.includes('ean_13') || formats.includes('ean_8');
                    setIsNativeSupported(supported);
                    if (!supported && scannerType === 'native') {
                        setScannerTypeState('quagga'); // Fallback if switched on unsupported device
                    }
                })
                .catch((e: any) => {
                    console.warn('BarcodeDetector check failed', e);
                    setIsNativeSupported(false);
                });
        } else {
            setIsNativeSupported(false);
        }
    }, [scannerType]);

    const [cameraDeviceId, setCameraDeviceId] = useState<string | undefined>(() => {
        return localStorage.getItem('camera_device_id') || undefined;
    });
    const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        // Enumerate cameras
        const getCameras = async () => {
            try {
                // Request permission first to get labels
                await navigator.mediaDevices.getUserMedia({ video: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const cameras = devices.filter(d => d.kind === 'videoinput');
                setAvailableCameras(cameras);
            } catch (e) {
                console.warn("Error enumerating devices:", e);
            }
        };
        getCameras();
    }, []);

    const setScannerType = (type: ScannerType) => {
        setScannerTypeState(type);
        localStorage.setItem('scanner_type', type);
    };

    const setCamera = (deviceId: string) => {
        setCameraDeviceId(deviceId);
        localStorage.setItem('camera_device_id', deviceId);
    };

    return (
        <ScannerContext.Provider value={{
            scannerType,
            setScannerType,
            isNativeSupported,
            cameraDeviceId,
            setCameraDeviceId: setCamera,
            availableCameras
        }}>
            {children}
        </ScannerContext.Provider>
    );
};

export const useScanner = () => {
    const context = useContext(ScannerContext);
    if (!context) {
        throw new Error('useScanner must be used within a ScannerProvider');
    }
    return context;
};
