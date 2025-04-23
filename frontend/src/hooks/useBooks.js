import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../services/api/ApiService';

export const useBooks = (
  offset = 0,
  limit = 10,
  category_id = null,
  author_id = null,
  desc_price = null
) => {
  
  const params = {
    offset,
    limit,
    ...(category_id !== null && { category_id }),
    ...(author_id !== null && { author_id }),
    ...(desc_price !== null && { desc_price })
  };

  const queryKey = [
    'books', 
    offset, 
    limit, 
    category_id, 
    author_id, 
    desc_price
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
  author_id = null
) => {
  const params = {
    offset,
    limit,
    ...(category_id !== null && { category_id }),
    ...(author_id !== null && { author_id })
  };

  const { 
    data, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['saleBooks', offset, limit, category_id, author_id],
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

export const useFeaturedBooks = (limit = 8) => {
  return useBooks(0, limit);
};