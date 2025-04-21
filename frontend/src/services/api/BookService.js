import { API_BASE_URL } from './config';

export const fetchBooks = async (
  offset = 0, 
  limit = 10,
  category_id = null,
  author_id = null,
  desc_price = null,
) => {
  try {
    let url = `${API_BASE_URL}/books/?offset=${offset}&limit=${limit}`;
    
    if (category_id !== null) {
      url += `&category_id=${category_id}`;
    }

    if (author_id !== null) {
      url += `&author_id=${author_id}`;
    }

    if (desc_price !== null) {
      url += `&desc_price=${desc_price}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

export const fetchSaleBooks = async (
  offset = 0, 
  limit = 10,
  category_id = null,
  author_id = null
) => {
  try {
    let url = `${API_BASE_URL}/books/discounts?offset=${offset}&limit=${limit}`;
    
    if (category_id !== null) {
      url += `&category_id=${category_id}`;
    }

    if (author_id !== null) {
      url += `&author_id=${author_id}`;
    }
    
    const response = await fetch(url);
    
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