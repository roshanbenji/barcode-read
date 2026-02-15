import axios from 'axios';

const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export const uploadImageToImgBB = async (file: File): Promise<string> => {
    try {
        const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

        if (!apiKey) {
            throw new Error('ImgBB API Key is missing in .env');
        }

        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('image', file);

        const response = await axios.post(IMGBB_API_URL, formData);

        if (response.data && response.data.data && response.data.data.url) {
            return response.data.data.url;
        } else {
            throw new Error('Invalid response from ImgBB');
        }
    } catch (error) {
        console.error('Image upload failed:', error);
        throw error;
    }
};
