
import { useState, useEffect, useRef } from 'react';
import type { Book } from '../types';
import { X, BookOpen, Link as LinkIcon, Save, Camera, Search } from 'lucide-react';
import { uploadImageToImgBB } from '../services/imageUpload';
import { fetchBookByISBN } from '../services/booksApi';

interface ConfirmationModalProps {
    book: Partial<Book> | null;
    isOpen: boolean;
    onConfirm: (editedBook: Partial<Book>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ConfirmationModal = ({ book, isOpen, onConfirm, onCancel, isLoading }: ConfirmationModalProps) => {
    const [editedBook, setEditedBook] = useState<Partial<Book>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIsbnLookup = async () => {
        const isbn = editedBook.isbn?.replace(/[-\s]/g, '') || '';
        if (isbn.length < 10) return;
        setIsLookingUp(true);
        try {
            const result = await fetchBookByISBN(isbn);
            if (result) {
                setEditedBook(prev => ({
                    ...prev,
                    title: result.title || prev.title,
                    authors: result.authors?.length ? result.authors : prev.authors,
                    description: result.description || prev.description,
                    thumbnail: result.thumbnail || prev.thumbnail,
                    pageCount: result.pageCount || prev.pageCount,
                    publishedDate: result.publishedDate || prev.publishedDate,
                }));
            }
        } catch (err) {
            console.error('ISBN lookup failed:', err);
        } finally {
            setIsLookingUp(false);
        }
    };

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const imageUrl = await uploadImageToImgBB(file);
            setEditedBook(prev => ({ ...prev, thumbnail: imageUrl }));
        } catch (error) {
            alert("Failed to upload image. Please try again.");
            console.error(error);
        } finally {
            setIsUploading(false);
            // Clear input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
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
                                    <div className="relative w-24 h-36 flex-shrink-0 group">
                                        <img
                                            src={editedBook.thumbnail}
                                            alt={editedBook.title}
                                            className="w-full h-full object-cover rounded-md shadow-md bg-gray-100"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,...';
                                            }}
                                        />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="w-24 h-36 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 flex-shrink-0 border border-gray-200 relative">
                                        {isUploading ? (
                                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <BookOpen size={32} />
                                        )}
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
                                            onChange={(e) => setEditedBook({ ...editedBook, authors: e.target.value.split(',') })}
                                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="Author 1, Author 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Category</label>
                                    <select
                                        value={editedBook.category || 'Others'}
                                        onChange={(e) => setEditedBook({ ...editedBook, category: e.target.value as any })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    >
                                        <option value="Theology">Theology</option>
                                        <option value="Christian Living">Christian Living</option>
                                        <option value="Bibles">Bibles</option>
                                        <option value="Biography">Biography</option>
                                        <option value="Devotional">Devotional</option>
                                        <option value="Inspirational">Inspirational</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Non Fiction">Non Fiction</option>
                                        <option value="Business">Business</option>
                                        <option value="Marriage">Marriage</option>
                                        <option value="Parenting">Parenting</option>
                                        <option value="Poetry">Poetry</option>
                                        <option value="Toddlers">Toddlers</option>
                                        <option value="Kids">Kids</option>
                                        <option value="Teens">Teens</option>
                                        <option value="Comics">Comics</option>
                                        <option value="Commentaries">Commentaries</option>
                                        <option value="History">History</option>
                                        <option value="Science and Technology">Science and Technology</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Condition</label>
                                    <select
                                        value={editedBook.condition || 'Good'}
                                        onChange={(e) => setEditedBook({ ...editedBook, condition: e.target.value as any })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                    >
                                        <option value="New">New</option>
                                        <option value="Good">Good</option>
                                        <option value="Worn">Worn</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-1"><LinkIcon size={12} /> Cover Image</span>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="text-indigo-600 flex items-center gap-1 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]"
                                    >
                                        <Camera size={12} />
                                        Upload / Take Photo
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    value={editedBook.thumbnail || ''}
                                    onChange={(e) => setEditedBook({ ...editedBook, thumbnail: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono text-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-1"
                                    placeholder="https://example.com/image.jpg"
                                />

                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                />

                                <p className="text-[10px] text-gray-400">
                                    Paste a URL or tap the camera icon to upload a photo.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ISBN:</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={editedBook.isbn || ''}
                                    onChange={(e) => setEditedBook({ ...editedBook, isbn: e.target.value })}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleIsbnLookup(); }}
                                    className="flex-1 text-sm font-mono text-gray-700 bg-transparent border-none outline-none p-0"
                                    placeholder="No ISBN (optional)"
                                />
                                <button
                                    onClick={handleIsbnLookup}
                                    disabled={isLookingUp || !editedBook.isbn || editedBook.isbn.replace(/[-\s]/g, '').length < 10}
                                    className="p-1 text-indigo-600 hover:text-indigo-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                                    title="Look up book details"
                                >
                                    {isLookingUp ? (
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Search size={16} />
                                    )}
                                </button>
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
                        disabled={!book || isLoading || isUploading}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        Save Book
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;

