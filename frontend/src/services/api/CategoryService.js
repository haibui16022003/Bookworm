import { API_BASE_URL } from "./config";

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log('Fetched categories:', data);
        return data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}