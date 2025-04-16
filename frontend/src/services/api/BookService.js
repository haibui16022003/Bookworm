import { API_BASE_URL } from './config';

export const fetchBooks = async (offset = 0, limit = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/?offset=${offset}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
  
      const data = await response.json();
      console.log('Fetched books:', data); // <- log the actual JSON
      return data;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  };

export const fetchSaleBooks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/discounts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch sale books');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching sale books:', error);
    throw error;
  }
};

export const fetchBookById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch book with id ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching book ${id}:`, error);
    throw error;
  }
};
