import axios from 'axios';
import type { Book, GoogleBookVolumeInfo } from '../types';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const OPEN_LIBRARY_API_URL = 'https://openlibrary.org/api/books';

const fetchFromOpenLibrary = async (isbn: string): Promise<Partial<Book> | null> => {
    try {
        const response = await axios.get(OPEN_LIBRARY_API_URL, {
            params: {
                bibkeys: `ISBN:${isbn}`,
                format: 'json',
                jscmd: 'data'
            }
        });

        const key = `ISBN:${isbn}`;
        const data = response.data[key];

        if (!data) return null;

        return {
            isbn,
            title: data.title || 'Unknown Title',
            authors: data.authors?.map((a: any) => a.name) || ['Unknown Author'],
            description: data.description || '',
            thumbnail: data.cover?.medium || data.cover?.small || '',
            pageCount: data.number_of_pages || 0,
            publishedDate: data.publish_date || '',
        };
    } catch (error) {
        console.warn("Open Library lookup failed:", error);
        return null;
    }
};

export const fetchBookByISBN = async (isbn: string): Promise<Partial<Book> | null> => {
    console.log("Fetching book for ISBN:", isbn);

    // 1. Try Google Books API
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
        const url = `${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}${apiKey ? `&key=${apiKey}` : ''}`;

        const response = await axios.get(url);

        if (response.data.totalItems > 0 && response.data.items) {
            const volumeInfo: GoogleBookVolumeInfo = response.data.items[0].volumeInfo;
            // Extract higher quality image if possible, API returns http usually, force https
            let thumbnail = volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '';

            return {
                isbn,
                title: volumeInfo.title,
                authors: volumeInfo.authors || ['Unknown Author'],
                description: volumeInfo.description || '',
                thumbnail,
                pageCount: volumeInfo.pageCount,
                publishedDate: volumeInfo.publishedDate,
            };
        }
    } catch (error: any) {
        console.warn("Google Books API failed or empty:", error);
    }

    // 2. Try Open Library API
    console.log("Falling back to Open Library...");
    const openLibraryBook = await fetchFromOpenLibrary(isbn);
    if (openLibraryBook) {
        return openLibraryBook;
    }

    // 3. Return "Unknown Book" placeholder (User requested this fallback)
    console.log("No book found in APIs. Returning Unknown Book.");
    return {
        isbn,
        title: 'Unknown Title',
        authors: ['Unknown Author'],
        description: '',
        thumbnail: '',
        pageCount: 0,
        publishedDate: '',
    };
};
