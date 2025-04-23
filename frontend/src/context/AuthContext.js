import { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, postData } from '../services/api/ApiService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, error: userError, refetch: userRefetch } = useQuery({
    queryKey: ['auth-user'],
    queryFn: () => fetchData('/auth/me', {}, true),
    onError: false,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  // Login mutation
  const { 
    mutate: loginMutate, 
    isPending: isLoginPending,
    error: loginError 
  } = useMutation({
    mutationFn: async ({email, password}) => {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      return postData('/auth/login/', formData, false);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-user'], data.user);
      return data;
    }
  });

  // Logout mutation
  const { 
    mutate: logoutMutate,
    isPending: isLogoutPending 
  } = useMutation({
    mutationFn: () => postData('/auth/logout/', {}, true),
    onSuccess: () => {
      queryClient.setQueryData(['auth-user'], null);
    }
  });

  // Register mutation
  const { 
    mutate: registerMutate, 
    isPending: isRegisterPending,
    error: registerError 
  } = useMutation({
    mutationFn: (userData) => postData('/auth/register/', userData, false),
    onSuccess: (data) => {
      queryClient.setQueryData(['auth-user'], data.user);
      return data;
    }
  });

  const login = async (email, password) => {
    try {
      return await loginMutate({ email, password });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return await registerMutate(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutate();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isUserLoading,
        userError,
        userRefetch,
        login,
        isLoginPending,
        loginError,
        logout,
        isLogoutPending,
        register,
        isRegisterPending,
        registerError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider ;