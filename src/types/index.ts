export interface Book {
    id?: number;
    isbn: string;
    title: string;
    authors: string[];
    description?: string;
    thumbnail?: string;
    pageCount?: number;
    publishedDate?: string;
    dateAdded: string;
    category?: 'Theology' | 'Christian Living' | 'Biography' | 'Devotional' | 'Fiction' | 'Others';
    condition?: 'New' | 'Good' | 'Worn';
}

export interface GoogleBookVolumeInfo {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
        thumbnail: string;
        smallThumbnail?: string;
    };
    pageCount?: number;
    publishedDate?: string;
    industryIdentifiers?: {
        type: string;
        identifier: string;
    }[];
}
