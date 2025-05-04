import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../services/api/ApiService';

export const useCategories = () => {
  const { 
    data, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchData('/categories/', {}, false),
    select: (data) => data.results || data || [],
    staleTime: 300000,
  });

  return { 
    categories: data || [], 
    loading, 
    error: error?.message || null 
  };
};