import { createContext, useContext, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchData, postData } from '../services/api/ApiService';

// Custom event for logout
export const LOGOUT_EVENT = 'user-logout';

const AuthContext = createContext();

const saveAuthData = (userData, accessToken) => {
  if (userData) localStorage.setItem('user', JSON.stringify(userData));
  if (accessToken) localStorage.setItem('access_token', accessToken);
};

const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
};

const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Failed to parse user data from localStorage', e);
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();

  // Initialize with data from localStorage if available
  useEffect(() => {
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      queryClient.setQueryData(['auth-user'], storedUser);
    }
  }, [queryClient]);

  const { data: user, isLoading: isUserLoading, error: userError, refetch: userRefetch } = useQuery({
    queryKey: ['auth-user'],
    // Using load from storage instead of API call
    queryFn: () => loadUserFromStorage(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
    retry: false,
    initialData: loadUserFromStorage(),
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
      return postData('/auth/login/', formData, false, { withCredentials: true });
    },
    onSuccess: (data) => {
      saveAuthData(data.user, data.access_token);
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
      clearAuthData();
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    },
    onError: () => {
      queryClient.setQueryData(['auth-user'], null);
      clearAuthData();
      window.dispatchEvent(new Event(LOGOUT_EVENT));
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
      console.log('Registering user:', userData);
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

export default AuthProvider;