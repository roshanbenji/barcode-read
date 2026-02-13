import axios from 'axios';
import type { Book, GoogleBookVolumeInfo } from '../types';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const fetchBookByISBN = async (isbn: string): Promise<Partial<Book> | null> => {
    console.log("Fetching book for ISBN:", isbn);
    try {
        const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
        const url = `${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}${apiKey ? `&key=${apiKey}` : ''}`;

        if (!apiKey) {
            console.warn('Google Books API Key is missing. Rate limits will be low.');
        }

        const response = await axios.get(url);

        if (response.data.totalItems === 0 || !response.data.items) {
            throw new Error(`No books found for ISBN: ${isbn}`);
        }

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
    } catch (error: any) {
        console.error("Error fetching book details:", error);
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429) {
                throw new Error("Google Books API Quota Exceeded. Please try again later.");
            }
            if (error.response?.status === 403) {
                throw new Error("Google Books API Key is invalid or restricted.");
            }
            throw new Error(error.response?.data?.error?.message || error.message);
        }
        throw error;
    }
};
