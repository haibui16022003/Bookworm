import { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api/CategoryService';

const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoading(true);
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        };

        loadCategories();
    }, [fetchCategories]);

    return { categories, loading, error };
};

export default useCategories;