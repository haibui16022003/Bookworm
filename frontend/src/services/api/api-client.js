import axios from 'axios'
import { API_BASE_URL } from './config'

const publicApiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
})


const authApiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

authApiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

authApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('Error:', error);
        
        // Only try to refresh if we get a 401 (Unauthorized) and haven't retri// ed yet
        // if (error.response?.status !== 401 || originalRequest._re//     try) {
        //     return Promise.reject(error// );
        // }

        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return authApiClient(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            // Attempt to refresh token - this should use the refresh token from the HTTP-only cookie
            const response = await authApiClient.post('/auth/refresh', {}, { withCredentials: true });
            const { access_token } = response.data;
            
            // Update localStorage with new token
            localStorage.setItem('access_token', access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
            processQueue(null, access_token);
            
            // Retry the original request with the new token
            return authApiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            
            // Clear auth data on refresh failure
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('auth:logout-required'));
            
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export { publicApiClient, authApiClient }
