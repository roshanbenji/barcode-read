import { useState, useEffect } from 'react';
import type { Book } from '../types';
import { X, BookOpen, Link as LinkIcon, Save } from 'lucide-react';

interface ConfirmationModalProps {
    book: Partial<Book> | null;
    isOpen: boolean;
    onConfirm: (editedBook: Partial<Book>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmationModal = ({ book, isOpen, onConfirm, onCancel, isLoading }: ConfirmationModalProps) => {
    const [editedBook, setEditedBook] = useState<Partial<Book>>({});

    // Reset edited book when a new book is scanned
    useEffect(() => {
        if (book) {
            setEditedBook(book);
        }
    }, [book]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(editedBook);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header with image background effect */}
                <div className="relative h-32 bg-indigo-600 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                    {editedBook.thumbnail && (
                        <img
                            src={editedBook.thumbnail}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
                        />
                    )}
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg tracking-tight">
                            {isLoading ? 'Scanning...' : 'Edit Book Details'}
                        </h3>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Fetching book details...</p>
                        </div>
                    ) : book ? (
                        <div className="flex flex-col gap-5">
                            <div className="flex gap-4">
                                {editedBook.thumbnail ? (
                                    <img
                                        src={editedBook.thumbnail}
                                        alt={editedBook.title}
                                        className="w-24 h-36 object-cover rounded-md shadow-md bg-gray-100 flex-shrink-0"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,...'; // Optional: fallback
                                            // Ideally just hide it or show placeholder, but simple is fine for now
                                        }}
                                    />
                                ) : (
                                    <div className="w-24 h-36 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0 border border-gray-200">
                                        <BookOpen size={32} />
                                    </div>
                                )}
                                <div className="flex flex-col flex-1 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={editedBook.title || ''}
                                            onChange={(e) => setEditedBook({ ...editedBook, title: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="Enter Title"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Author(s)</label>
                                        <input
                                            type="text"
                                            value={editedBook.authors?.join(', ') || ''}
                                            onChange={(e) => setEditedBook({ ...editedBook, authors: e.target.value.split(',').map(s => s.trim()) })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="Author 1, Author 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                    <LinkIcon size={12} /> Cover Image URL
                                </label>
                                <input
                                    type="text"
                                    value={editedBook.thumbnail || ''}
                                    onChange={(e) => setEditedBook({ ...editedBook, thumbnail: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Paste a direct link to an image to update the cover.</p>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ISBN:</span>
                                <span className="text-sm font-mono text-gray-700">{book.isbn}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-red-500">
                            Could not find book details.
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 flex gap-3 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!book || isLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Save size={18} />
                        Save Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
