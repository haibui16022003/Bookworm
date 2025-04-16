import { useState, useEffect } from 'react';
import { fetchBooks, fetchSaleBooks, fetchBookById } from '../services/api/BookService';

export const useBooks = (offset = 0, limit = 10) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchBooks(offset, limit);
        setBooks(data.results || data);
        if (data.count) setTotalCount(data.count);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadBooks();
  }, [offset, limit]);

  return { books, loading, error, totalCount };
};

export const useOnSaleBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSaleBooks = async () => {
      try {
        setLoading(true);
        const data = await fetchSaleBooks();
        setBooks(data.results || data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadSaleBooks();
  }, []);

  return { books, loading, error };
};

export const useBookDetails = (bookId) => {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookDetails = async () => {
      if (!bookId) return;
      
      try {
        setLoading(true);
        const data = await fetchBookById(bookId);
        setBook(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadBookDetails();
  }, [bookId]);

  return { book, loading, error };
};


// Featured books hook -- CUSTOMIZE AFTER 
export const useFeaturedBooks = (limit = 8) => {
  const { books, loading, error } = useBooks(0, limit);
  return { books, loading, error };
};