import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postData } from "../services/api/ApiService";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  const { 
    mutate: createOrder, 
    isPending: loading,
    isError,
    error,
    isSuccess,
    data: createdOrder
  } = useMutation({
    mutationFn: (orderData) => {
      // Create config with headers to see them in logs
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      };
      return postData('/orders/', orderData, true, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  return { 
    createOrder, 
    loading, 
    error: isError ? error?.message || 'Failed to create order' : null,
    success: isSuccess,
    createdOrder 
  };
};