import type { Book } from '../types';
import { Check, X, BookOpen } from 'lucide-react';

interface ConfirmationModalProps {
    book: Partial<Book> | null;
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmationModal = ({ book, isOpen, onConfirm, onCancel, isLoading }: ConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header with image background effect */}
                <div className="relative h-32 bg-indigo-600 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                    {book?.thumbnail && (
                        <img
                            src={book.thumbnail}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
                        />
                    )}
                    <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg tracking-tight">Confirm Book</h3>
                    </div>
                </div>

                <div className="p-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500">Fetching book details...</p>
                        </div>
                    ) : book ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                {book.thumbnail ? (
                                    <img
                                        src={book.thumbnail}
                                        alt={book.title}
                                        className="w-24 h-36 object-cover rounded-md shadow-md bg-gray-100 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-24 h-36 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <BookOpen size={32} />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <h4 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-3">{book.title}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{book.authors?.join(', ') || 'Unknown Author'}</p>
                                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full self-start font-medium">
                                        ISBN: {book.isbn}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-red-500">
                            Could not find book details.
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 flex gap-3 border-t border-gray-100">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!book || isLoading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Check size={18} />
                        Add Application
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
