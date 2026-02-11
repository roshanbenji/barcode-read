import axios from 'axios';
import type { Book, GoogleBookVolumeInfo } from '../types';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export const fetchBookByISBN = async (isbn: string): Promise<Partial<Book> | null> => {
    try {
        const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?q=isbn:${isbn}`);

        if (response.data.totalItems === 0 || !response.data.items) {
            return null;
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
    } catch (error) {
        console.error("Error fetching book details:", error);
        return null;
    }
};
