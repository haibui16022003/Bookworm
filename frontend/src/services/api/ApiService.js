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
        const response = await client.post(endpoint, data, config);
        return response.data;
    } catch (error) {
        console.error(`Error posting to ${endpoint}:`, error);
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
