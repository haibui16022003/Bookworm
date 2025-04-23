import { API_BASE_URL } from './config';


export const login = async (email, password) => {
    try{
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }

        const data = await response.json();
        console.log('Login successful:', data);
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}


export const register = async (userData) => {
    try{
        const response = await fetch(`${API_BASE_URL}/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Registration failed');
        }

        const data = await response.json();
        console.log('Registration successful:', data);
        return data;
    }
    catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
}


export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
            method: 'POST',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Logout failed');
        }

        console.log('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
}