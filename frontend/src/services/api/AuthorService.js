import { API_BASE_URL } from "./config";


export const fetchAuthors = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/authors/`);
        
        if (!response.ok) {
        throw new Error('Failed to fetch authors');
        }
        
        const data = await response.json();
        console.log('Fetched authors:', data);
        return data;
    } catch (error) {
        console.error('Error fetching authors:', error);
        throw error;
    }
}