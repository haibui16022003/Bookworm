import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../services/api/ApiService';

export const useBooks = (
  offset = 0,
  limit = 10,
  category_id = null,
  author_id = null,
  desc_price = null,
  min_stars = null
) => {
  
  const params = {
    offset,
    limit,
    ...(category_id !== null && { category_id }),
    ...(author_id !== null && { author_id }),
    ...(desc_price !== null && { desc_price }),
    ...(min_stars !== null && { min_stars })
  };

  const queryKey = [
    'books', 
    offset, 
    limit, 
    category_id, 
    author_id, 
    desc_price,
    min_stars
  ];

  // Use React Query without auth
  const { 
    data, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey,
    queryFn: () => fetchData('/books/', params, false), 
    staleTime: 60000, 
  });

  const books = data?.data || data?.results || data || [];
  const totalCount = data?.total || data?.count || 0;
  const currentPage = data?.page_num || 1;

  return { 
    books, 
    loading, 
    error: error?.message || null, 
    totalCount, 
    currentPage 
  };
};

export const useOnSaleBooks = (
  offset = 0,
  limit = 10,
  category_id = null,
  author_id = null,
  min_stars = null
) => {
  const params = {
    offset,
    limit,
    ...(category_id !== null && { category_id }),
    ...(author_id !== null && { author_id }),
    ...(min_stars !== null && { min_stars })
  };

  const { 
    data, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['saleBooks', offset, limit, category_id, author_id, min_stars],
    queryFn: () => fetchData('/books/discounts', params, false), 
    staleTime: 60000,
  });

  const books = data?.data || data?.results || data || [];
  const totalCount = data?.total || data?.count || 0;
  const currentPage = data?.page_num || 1;

  return { 
    books, 
    loading, 
    error: error?.message || null, 
    totalCount, 
    currentPage 
  };
};

export const useBookDetails = (id) => {
  const { 
    data: book, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['book', id],
    queryFn: () => fetchData(`/books/${id}/`, {}, false), // No auth required
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });

  return { 
    book: book || null, 
    loading, 
    error: error?.message || null 
  };
};

export const useRecommendedBooks = (limit = 8) => {
  const {
    data: books, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['recommendedBooks', limit],
    queryFn: () => fetchData('/books/recommended/', { limit }, false), // No auth required
    staleTime: 60000, // 1 minute
  });

  return { 
    books: books || [], 
    loading, 
    error: error?.message || null 
  };
};

export const usePopularBooks = (limit = 8) => {
  const {
    data: books, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['popularBooks', limit],
    queryFn: () => fetchData('/books/popular/', { limit }, false), // No auth required
    staleTime: 60000, // 1 minute
  });

  return { 
    books: books || [], 
    loading, 
    error: error?.message || null 
  };
};

export const useTopDiscountedBooks = (limit = 10) => {
  const {
    data: books,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['topDiscountedBooks', limit],
    queryFn: () => fetchData('/books/top-discounted', { limit }, false), // No auth required
    staleTime: 60000, // 1 minute
  });

  return {
    books: books || [],
    loading,
    error: error?.message || null
  };
};

export const useFeaturedBooks = () => {
  const { books: recommendedBooks, loading: recommendedLoading, error: recommendedError } = useRecommendedBooks();
  const { books: popularBooks, loading: popularLoading, error: popularError } = usePopularBooks();

  return {
    recommendedBooks,
    recommendedLoading,
    recommendedError,
    popularBooks,
    popularLoading,
    popularError
  };
};