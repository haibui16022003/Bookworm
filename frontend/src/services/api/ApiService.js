import { publicApiClient, authApiClient } from "./api-client";
import { API_BASE_URL } from "./config";


// Generic GET handler
export const fetchData = async (endpoint, params = {}, requireAuth = false) => {
    try {
        const client = requireAuth ? authApiClient : publicApiClient;
        const response = await client.get(endpoint, { params });
        return response.data
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
    }
}


// Generic POST handler
export const postData = async (endpoint, data, requiresAuth = true, config = {}) => {
    try {
        const client = requiresAuth ? authApiClient : publicApiClient;
        
        // Get token from local storage
        const token = localStorage.getItem('access_token');
        
        // Log the complete headers that will be sent
        console.log('Request Headers being sent:', {
            ...config.headers,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        });
        
        // Log local storage data
        const localStorageData = localStorage.getItem('user');
        if (localStorageData) {
            console.log('Local Storage User Data:', JSON.parse(localStorageData));
        } else {
            console.log('No user data found in local storage.');
        }
        
        if (token) {
            console.log('Access Token found:', token.substring(0, 10) + '...');
        } else {
            console.log('No access token found in local storage.');
        }
        // Log request data
        console.log('Request Data:', data);
        
        const response = await client.post(endpoint, data, config);
        console.log('Response status:', response.status);
        return response.data;
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
        console.error('Full error object:', error);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}


// Generic PUT handler
export const putData = async (endpoint, data, requiresAuth = true, config = {}) => {
    try {
        const client = requiresAuth ? authApiClient : publicApiClient;
        const response = await client.put(endpoint, data, config);
        return response.data;
    } catch (error) {
        console.error(`Error putting to ${endpoint}:`, error);
        throw error;
    }
};


// Generic DELETE handler
export const deleteData = async (endpoint, requiresAuth = true, config = {}) => {
    try {
        const client = requiresAuth ? authApiClient : publicApiClient;
        const response = await client.delete(endpoint, config);
        return response.data;
    } catch (error) {
        console.error(`Error deleting from ${endpoint}:`, error);
        throw error;
    }
};


// Form data handler
export const postFormData = async (endpoint, formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed request to ${endpoint}`);
        }
    
        return await response.json();
    } catch (error) {
        console.error(`Error posting form data to ${endpoint}:`, error);
        throw error;
    }
};