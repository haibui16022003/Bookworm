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

        // If error is not 401 or request has already been retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

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
            // Attempt to refresh token
            const response = await authApiClient.post('/auth/refresh');
            const { access_token } = response.data;
            
            // Update localStorage with new token
            localStorage.setItem('access_token', access_token);
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
            processQueue(null, access_token);
            
            // Retry the original request with the new token
            return authApiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            
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
