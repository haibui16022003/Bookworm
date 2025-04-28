from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict

from app.controllers.ReviewController import ReviewController
from app.schema.ReviewSchema import ReviewResponse, ReviewCreate

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/book/{book_id}", response_model=Dict)
async def get_book_reviews(
    book_id: int,
    offset: int = Query(0, description="Offset for pagination"),
    limit: int = Query(20, description="Limit for pagination"),
    rating_star: Optional[int] = Query(None, description="Filter by rating star"),
    is_desc: bool = Query(True, description="Sort order"),
    review_controller: ReviewController = Depends(ReviewController),
):
    """
    Get reviews for a specific book.
    :param book_id: The ID of the book to get reviews for.
    :param offset: Offset for pagination
    :param limit: Page size
    :param rating_star: Filter by rating star
    :param is_desc: Sort order
    :param review_controller: ReviewController dependency
    :return: List of ReviewResponse objects
    """
    review_controller.set_book_id(book_id)
    reviews = review_controller.get_book_reviews_list(offset=offset, limit=limit, rating_star=rating_star, is_desc=is_desc)
    general_reviews_info = review_controller.get_book_rating_general()
    response = {
        "book_id": book_id,
        "reviews": reviews,
        "avg_rating": general_reviews_info["average_rating"],
        "stars_count": general_reviews_info["stars_count"],
        "total_reviews": general_reviews_info["total_reviews"],
    }
    return response


@router.post("/", response_model=ReviewResponse)
async def create_review(
    review: ReviewCreate,
    review_controller: ReviewController = Depends(ReviewController)
) -> ReviewResponse:
    """
    Create a new review for a book.
    :param review: ReviewCreate object
    :param review_controller: ReviewController dependency
    :return: Created ReviewResponse object
    """
    review_controller.set_book_id(review.book_id)
    created_review = review_controller.add_review(review)
    return created_review
