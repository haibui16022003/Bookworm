import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import Pagination from '../ui/Pagination';
import { useReviews } from '../../hooks/useReviews';

const CustomerReviews = ({ bookId }) => {
    const [sortOrder, setSortOrder] = useState('newest');
    const [reviewsPerPage, setReviewsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [starFilter, setStarFilter] = useState(null);
    
    // Calculate offset for pagination
    const offset = (currentPage - 1) * reviewsPerPage;
    
    // Use the hook to fetch reviews
    const { reviews, reviewStats, loading, error } = useReviews(
        bookId,
        offset,
        reviewsPerPage,
        starFilter,
        sortOrder === 'newest' ? true : sortOrder === 'oldest' ? false : null
    );
    
    // Make sure reviewStats exists and has expected properties
    const safeReviewStats = reviewStats || { totalReviews: 0, avgRating: 0, starsCount: {} };
    const totalPages = Math.ceil(safeReviewStats.totalReviews / reviewsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleStarFilter = (stars) => {
        setStarFilter(stars);
        setCurrentPage(1);
    };

    const handleSortOrderChange = (value) => {
        setSortOrder(value);
    };

    const handleReviewsPerPageChange = (value) => {
        setReviewsPerPage(Number(value));
        setCurrentPage(1);
    };

    if (error) {
        return <div className="text-red-500">Error loading reviews: {error}</div>;
    }

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
                Customer Reviews {starFilter ? `(Filtered by ${starFilter} star)` : ''}
            </h2>
            <div className="flex items-center gap-4 mb-4">
                <div className="text-sm flex flex-wrap gap-2 items-center">
                    <span className="font-semibold">
                        {safeReviewStats.avgRating} Star
                    </span>
                    <span>
                        ({safeReviewStats.totalReviews})
                    </span>
                    {[5, 4, 3, 2, 1].map(stars => (
                        <button
                            key={stars}
                            onClick={() => handleStarFilter(stars)}
                            className={`text-gray-500 hover:text-blue-600 transition-colors ${starFilter === stars ? "font-semibold text-blue-700" : ""}`}
                        >
                            {stars} star ({(safeReviewStats.starsCount && safeReviewStats.starsCount[stars]) || 0}) |
                        </button>
                    ))}
                    <button
                        onClick={() => handleStarFilter(null)}
                        className={`text-gray-500 hover:text-blue-600 transition-colors ${starFilter === null ? "font-semibold text-blue-700" : ""}`}
                    >
                        All
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <p className="text-sm text-gray-600">
                    Showing {safeReviewStats.totalReviews > 0 ? offset + 1 : 0}-{Math.min(offset + reviewsPerPage, safeReviewStats.totalReviews)} of {safeReviewStats.totalReviews} reviews
                </p>
                <div className="flex flex-wrap items-center gap-4">
                    <select
                        value={sortOrder}
                        onChange={(e) => handleSortOrderChange(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="newest">Sort by date: newest to oldest</option>
                        <option value="oldest">Sort by date: oldest to newest</option>
                    </select>

                    <select
                        value={String(reviewsPerPage)}
                        onChange={(e) => handleReviewsPerPageChange(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="5">Show 5</option>
                        <option value="10">Show 10</option>
                        <option value="20">Show 20</option>
                        <option value="50">Show 50</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
            ) : (!reviews || reviews.length === 0) ? (
                <div className="text-center py-8 text-gray-500">No reviews found</div>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} className="mb-6 border-b pb-6 last:border-0">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {review.review_title}
                            <StarRating stars={review.rating_star} />
                        </h3>
                        <p className="text-gray-700 mb-2">{review.review_details}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(review.review_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                ))
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default CustomerReviews;