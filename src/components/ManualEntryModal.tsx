import { useState } from 'react';
import { X, Search, PenLine } from 'lucide-react';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (isbn: string) => void;
    onManualInput: () => void;
    isSearching?: boolean;
}

const ManualEntryModal = ({ isOpen, onClose, onSearch, onManualInput, isSearching }: ManualEntryModalProps) => {
    const [isbn, setIsbn] = useState('');

    if (!isOpen) return null;

    const handleSearch = () => {
        const clean = isbn.replace(/[-\s]/g, '');
        if (clean.length > 0) {
            onSearch(clean);
            setIsbn('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleManual = () => {
        setIsbn('');
        onManualInput();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-5">
                    <h3 className="text-white font-semibold text-lg">Manual Entry</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* ISBN Input */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                            Enter ISBN Code
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="e.g. 9780134685991"
                                className="flex-1 p-3 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                autoFocus
                            />
                            <button
                                onClick={handleSearch}
                                disabled={isbn.replace(/[-\s]/g, '').length === 0 || isSearching}
                                className="px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-indigo-200"
                            >
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Search size={18} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5 px-1">
                            Type an ISBN-10 or ISBN-13 to look up book details automatically.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-xs text-gray-400 uppercase font-medium">or</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    {/* Manual Entry Button */}
                    <button
                        onClick={handleManual}
                        className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-medium hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                    >
                        <PenLine size={20} />
                        Enter Book Details Manually
                    </button>
                    <p className="text-xs text-gray-400 text-center -mt-2">
                        For books without an ISBN or barcode.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManualEntryModal;
