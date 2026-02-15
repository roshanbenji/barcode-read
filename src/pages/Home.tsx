import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks, deleteBook, updateBook, clearAllBooks } from '../services/db';
import type { Book } from '../types';
import { Plus, Download, Trash2, Search, Book as BookIcon, Settings, Trash, Pencil } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import SettingsModal from '../components/SettingsModal';
import ConfirmationModal from '../components/ConfirmationModal';

const Home = () => {
    const navigate = useNavigate();
    // useLiveQuery automatically updates when DB changes
    const books = useLiveQuery(() => getBooks()) || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.authors && book.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        book.isbn.includes(searchTerm)
    );

    const handleExport = () => {
        if (books.length === 0) return;

        const headers = ['ISBN', 'Title', 'Authors', 'Category', 'Condition', 'Date Added', 'Description', 'Image URL'];
        const csvContent = [
            headers.join(','),
            ...books.map(book => [
                `"${book.isbn}"`,
                `"${book.title.replace(/"/g, '""')}"`,
                `"${book.authors.join('; ')}"`,
                `"${book.category || 'Others'}"`,
                `"${book.condition || 'Good'}"`,
                `"${new Date(book.dateAdded).toLocaleDateString()}"`,
                `"${(book.description || '').replace(/"/g, '""')}"`,
                `"${book.thumbnail || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'library_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (id?: number) => {
        if (id && confirm('Are you sure you want to delete this book?')) {
            await deleteBook(id);
        }
    };

    const handleClearAll = async () => {
        if (books.length > 0 && confirm('Are you sure you want to delete ALL books? This action cannot be undone.')) {
            await clearAllBooks();
        }
    };

    const handleEdit = (book: Book) => {
        setEditingBook(book);
    };

    const handleSaveEdit = async (editedBook: Partial<Book>) => {
        if (editingBook && editingBook.id && editedBook) {
            await updateBook({
                ...editingBook,
                ...editedBook,
                id: editingBook.id, // Ensure ID is preserved
                dateAdded: editingBook.dateAdded || new Date().toISOString() // Preserve or set date
            } as Book);
            setEditingBook(null);
        }
    };

    return (
        <div className="pb-20">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 sticky top-20 z-30 bg-gray-50/95 p-2 -mx-2 backdrop-blur-sm rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your library..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="flex items-center justify-center p-3 bg-white text-gray-600 rounded-xl shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-indigo-600 transition-all"
                        title="Scanner Settings"
                    >
                        <Settings size={20} />
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={books.length === 0}
                        className="flex items-center justify-center p-3 bg-white text-red-500 rounded-xl shadow-sm ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        title="Clear Library"
                    >
                        <Trash size={20} />
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={books.length === 0}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Download size={20} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Book List */}
            <div className="space-y-4">
                {filteredBooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <BookIcon size={40} className="text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Your library is empty</h3>
                        <p className="text-gray-500 max-w-xs mt-2">
                            Tap the + button below to start scanning books and build your collection.
                        </p>
                    </div>
                ) : (
                    filteredBooks.map((book) => (
                        <div
                            key={book.id}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow group"
                        >
                            <div className="w-20 h-28 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden shadow-inner">
                                {book.thumbnail ? (
                                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <BookIcon size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate">{book.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{book.authors.join(', ')}</p>
                                <div className="flex items-center gap-2 mt-auto">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono">
                                        {book.isbn || 'No ISBN'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => handleEdit(book)}
                                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="Edit Book"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(book.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Book"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => navigate('/scan')}
                className="fixed bottom-6 right-6 w-16 h-16 bg-black text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40"
            >
                <Plus size={32} strokeWidth={2.5} />
            </button>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />

            <ConfirmationModal
                isOpen={!!editingBook}
                book={editingBook}
                onConfirm={handleSaveEdit}
                onCancel={() => setEditingBook(null)}
            />
        </div>
    );
};

export default Home;
