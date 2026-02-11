import Dexie, { type EntityTable } from 'dexie';
import type { Book } from '../types';

const db = new Dexie('LibraryDatabase') as Dexie & {
    books: EntityTable<Book, 'id'>;
};

// Schema definition
db.version(1).stores({
    books: '++id, isbn, title, authors, dateAdded' // Primary key and indexed props
});

export { db };

export const addBook = async (book: Omit<Book, 'id' | 'dateAdded'>) => {
    return await db.books.add({
        ...book,
        dateAdded: new Date().toISOString()
    });
};

export const getBooks = async () => {
    return await db.books.orderBy('dateAdded').reverse().toArray();
};

export const deleteBook = async (id: number) => {
    return await db.books.delete(id);
};
