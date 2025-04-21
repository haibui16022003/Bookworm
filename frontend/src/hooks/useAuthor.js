import { useState, useEffect } from "react";
import { fetchAuthors } from "../services/api/AuthorService";

export const useAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const loadAuthors = async () => {
        try {
            setLoading(true);
            const data = await fetchAuthors();
            setAuthors(data.results || data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
        };
    
        loadAuthors();
    }, []);
    
    return { authors, loading, error };
    }