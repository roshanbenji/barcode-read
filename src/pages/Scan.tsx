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

    const handleScan = async (isbn: string) => {
        setIsScanning(false);
        setIsLoading(true);
        setShowModal(true);

        // Clean up ISBN (remove dashes if any)
        const cleanIsbn = isbn.replace(/-/g, '');

        const book = await fetchBookByISBN(cleanIsbn);
        setIsLoading(false);

        if (book) {
            setScannedBook(book);
        } else {
            // Handle not found case or error
            setScannedBook({ isbn: cleanIsbn, title: 'Unknown Book', authors: [] });
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
    };

    const handleCloseScanner = () => {
        navigate('/');
    };

    return (
        <div className="h-full">
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
        </div>
    );
};

export default Scan;
