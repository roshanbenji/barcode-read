import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
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
    const [showSuccess, setShowSuccess] = useState(false);

    const handleScan = async (isbn: string) => {
        setIsScanning(false);
        setIsLoading(true);
        setShowModal(true);

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
            console.error("Scan Error (Suppressed):", err);

            // Should technically not happen now with the fallback, 
            // but if it does, we just resume scanning.
            setIsLoading(false);
            setShowModal(false);
            setIsScanning(true);
        }
    };

    const handleConfirm = async (editedBook: Partial<Book>) => {
        if (editedBook && editedBook.isbn) {
            await addBook({
                isbn: editedBook.isbn,
                title: editedBook.title || 'Unknown Title',
                authors: editedBook.authors || [],
                description: editedBook.description,
                thumbnail: editedBook.thumbnail,
                pageCount: editedBook.pageCount,
                publishedDate: editedBook.publishedDate,
            });

            // Continuous scanning logic:
            // 1. Close modal
            setShowModal(false);
            setScannedBook(null);

            // 2. Show success and restart scanner
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
            setIsScanning(true);
        }
    };

    const handleCancel = () => {
        setShowModal(false);
        setScannedBook(null);
        setIsScanning(true);
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

            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-[60] flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
                    <Check size={20} />
                    <span className="font-medium">Book Added!</span>
                </div>
            )}
        </div>
    );
};

export default Scan;
