import { useState, useEffect } from 'react';
import { fetchData, postData } from '../services/api/ApiService.js';

export const useReviews = (bookId, offset = 0, limit = 10, ratingStar = null, isDesc = true) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    avgRating: 0,
    starsCount: {},
    totalReviews: 0
  });

  const fetchReviewsData = async () => {
    if (!bookId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const endpoint = `/reviews/book/${bookId}`;
      const params = {
        offset,
        limit,
        rating_star: ratingStar,
        is_desc: isDesc
      };
      
      const responseData = await fetchData(endpoint, params, true);
      
      setReviews(responseData.reviews || []);
      setReviewStats({
        avgRating: responseData.avg_rating || 0,
        starsCount: responseData.stars_count || {},
        totalReviews: responseData.total_reviews || 0
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
  }, [bookId, offset, limit, ratingStar, isDesc]);

  // Function to submit a new review
  const submitReview = async (reviewData) => {
    try {
      // Post the new review
      await postData('/reviews/', reviewData, true);
      
      // Refresh the reviews to get updated data
      await fetchReviewsData();
      
      return true;
    } catch (err) {
      throw new Error(err.response?.data?.detail || err.message || 'Failed to submit review');
    }
  };

  return { reviews, reviewStats, loading, error, submitReview };
};