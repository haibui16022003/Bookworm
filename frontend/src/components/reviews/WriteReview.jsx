import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useReviews } from '../../hooks/useReviews'; // Adjust the import path as needed

const WriteReview = ({ bookId }) => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [rating, setRating] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Use the reviews hook - we're mostly interested in the submitReview function
    const { submitReview } = useReviews(bookId);

    const handleRatingChange = (newRating) => {
        setRating(newRating);
    };

    const handleSubmit = async () => {
        // Validate form fields
        if (!title.trim() || !details.trim()) {
            setSubmissionStatus('error');
            setErrorMessage('Please fill in all fields.');
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus('idle');
        setErrorMessage('');

        try {
            // Prepare the review data object
            const reviewData = {
                book_id: bookId,
                review_title: title.trim(),
                review_details: details.trim(),
                rating_star: rating
            };

            // Use the submitReview function from our hook
            await submitReview(reviewData);
            
            // Reset form after successful submission
            setSubmissionStatus('success');
            setTitle('');
            setDetails('');
            setRating(1);
        } catch (error) {
            setSubmissionStatus('error');
            setErrorMessage(error.message || 'Failed to submit review. Please try again.');
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Write a Review</h2>

            <div className="mb-4">
                <label htmlFor="review-title" className="block text-sm font-medium text-gray-700">Add a title</label>
                <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Summarize your review"
                    disabled={isSubmitting}
                />
            </div>

            <div className="mb-4">
                <label htmlFor="review-details" className="block text-sm font-medium text-gray-700">Details please! Your review helps other shoppers.</label>
                <textarea
                    id="review-details"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Write your review here"
                    disabled={isSubmitting}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Select a rating star</label>
                <div className="flex items-center mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleRatingChange(i + 1)}
                            className={
                                `mr-1 ${i < rating ? "text-yellow-400" : "text-gray-300"}
                                focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-md`
                            }
                            aria-label={`Rate ${i + 1} star`}
                            disabled={isSubmitting}
                        >
                            <Star className="h-6 w-6" />
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">{rating} Star</span>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors duration-200
                           ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"}`}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>

            {submissionStatus === 'success' && (
                <div className="mt-4 text-green-600 text-sm font-medium">
                    Thank you for your review!
                </div>
            )}
            {submissionStatus === 'error' && (
                <div className="mt-4 text-red-600 text-sm font-medium">
                    {errorMessage || 'Sorry, there was an error submitting your review. Please try again.'}
                </div>
            )}
        </div>
    );
};

export default WriteReview;