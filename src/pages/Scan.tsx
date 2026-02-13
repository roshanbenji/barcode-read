import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Scanner from '../components/Scanner';
import ConfirmationModal from '../components/ConfirmationModal';
import { fetchBookByISBN } from '../services/booksApi';
import { addBook } from '../services/db';
import type { Book } from '../types';

const Scan = () => {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(true);
    const [scannedBook, setScannedBook] = useState<Partial<Book> | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [lastScanned, setLastScanned] = useState<string>("");

    const handleScan = async (isbn: string) => {
        setIsScanning(false);
        setIsLoading(true);
        setShowModal(true);
        setError(null);
        setLastScanned(isbn);

        // Clean up ISBN (remove dashes if any)
        const cleanIsbn = isbn.replace(/-/g, '');

        // Basic ISBN validation
        // ISBN-13 starts with 978 or 979 and is 13 digits
        // ISBN-10 is 10 chars (last can be X)
        const isISBN13 = /^(978|979)\d{10}$/.test(cleanIsbn);
        const isISBN10 = /^\d{9}[\d|X]$/.test(cleanIsbn);

        if (!isISBN13 && !isISBN10) {
            console.log("Ignored invalid ISBN:", cleanIsbn);
            setIsScanning(true);
            setIsLoading(false);
            setShowModal(false);
            return;
        }

        try {
            const book = await fetchBookByISBN(cleanIsbn);
            setIsLoading(false);
            setScannedBook(book); // Now guaranteed to be a book or throw
        } catch (err: any) {
            console.error("Scan Error:", err);
            setIsLoading(false);
            setShowModal(false);
            setIsScanning(true);
            setError(err.message || "Failed to fetch book");
            alert(`Error: ${err.message}`);
        }
    };

    const handleConfirm = async () => {
        if (scannedBook && scannedBook.isbn) {
            await addBook({
                isbn: scannedBook.isbn,
                title: scannedBook.title || 'Unknown Title',
                authors: scannedBook.authors || [],
                description: scannedBook.description,
                thumbnail: scannedBook.thumbnail,
                pageCount: scannedBook.pageCount,
                publishedDate: scannedBook.publishedDate,
            });
            navigate('/');
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setScannedBook(null);
        setIsScanning(true);
        setError(null);
    };

    const handleCloseScanner = () => {
        navigate('/');
    };

    return (
        <div className="h-full relative">
            {isScanning && (
                <Scanner
                    onScanSuccess={handleScan}
                    onClose={handleCloseScanner}
                />
            )}

            <ConfirmationModal
                isOpen={showModal}
                book={scannedBook}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isLoading={isLoading}
            />

            {/* Debug Overlay */}
            {!isScanning && error && (
                <div className="fixed bottom-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                    <div className="mt-2 text-xs text-gray-600">
                        <p>Last Scanned: {lastScanned}</p>
                        <p>API Key Present: {import.meta.env.VITE_GOOGLE_BOOKS_API_KEY ? 'Yes' : 'No'}</p>
                    </div>
                    <button
                        onClick={() => { setError(null); setIsScanning(true); }}
                        className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scan;
