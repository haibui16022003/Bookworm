import { useQuery } from '@tanstack/react-query';
import { fetchData } from '../services/api/ApiService';

export const useAuthors = () => {
  const { 
    data, 
    isLoading: loading, 
    error 
  } = useQuery({
    queryKey: ['authors'],
    queryFn: () => fetchData('/authors/', {}, false),
    select: (data) => data.results || data || [],
    staleTime: 300000,
  });

  return { 
    authors: data || [], 
    loading, 
    error: error?.message || null 
  };
};