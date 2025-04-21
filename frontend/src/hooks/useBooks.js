import { useState, useEffect } from 'react';
import { fetchBooks, fetchSaleBooks, fetchBookById } from '../services/api/BookService';

export const useBooks = (
  offset = 0, 
  limit = 10, 
  category_id = null, 
  author_id = null,
  desc_price = null,
) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadBooks = async () => {
      console.log('useBooks hook called with params:', {
        offset,
        limit,
        category_id,
        author_id,
        desc_price
      });  

      try {
        setLoading(true);
        const response = await fetchBooks(offset, limit, category_id, author_id, desc_price);
        
        if (response.data) {
          setBooks(response.data);
          setTotalCount(response.total || 0);
          setCurrentPage(response.page_num || 1);
        } else {
          setBooks(response.results || response || []);
          if (response.count) setTotalCount(response.count);
        }
        console.log(response)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [offset, limit, category_id, author_id, desc_price]);

  return { books, loading, error, totalCount, currentPage };
};

export const useOnSaleBooks = (
  offset = 0,
  limit = 10,
  category_id = null,
  author_id = null,
) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadSaleBooks = async () => {
      try {
        setLoading(true);
        const response = await fetchSaleBooks(offset, limit, category_id, author_id);
        
        if (response.data) {
          setBooks(response.data);
          setTotalCount(response.total || 0);
          setCurrentPage(response.page_num || 1);
        } else {
          setBooks(response.results || response || []);
          if (response.count) setTotalCount(response.count);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSaleBooks();
  }, [offset, limit, category_id, author_id]);

  return { books, loading, error, totalCount, currentPage };
};

export const useBookDetails = (id) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchBookById(id);
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  return { book, loading, error };
};

export const useFeaturedBooks = (limit = 8) => {
  const { books, loading, error } = useBooks(0, limit);
  return { books, loading, error };
};