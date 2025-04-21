// http://localhost:8000/api/v1/reviews/1?offset=0&limit=10&is_desc=true
// response body ={
//     "book_id": 1,
//     "reviews": [
//       {
//         "book_id": 1,
//         "review_title": "Great Book!",
//         "review_details": "I really enjoyed this book. It was well written and engaging.",
//         "rating_star": 5,
//         "id": 1,
//         "review_date": "2025-04-17T00:00:00"
//       }
//     ],
//     "avg_rating": 5,
//     "stars_count": {
//       "5": 1
//     },
//     "total_reviews": 1
//   }

import { API_BASE_URL } from './config';

export const fetchReviews = async (bookId, offset = 0, limit = 10, isDesc = true) => {