from typing import Optional, Dict, List
from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from sqlalchemy import select, func

from app.schema.ReviewSchema import ReviewCreate, ReviewResponse
from app.models import ReviewModel
from app.db.session import get_session


class ReviewController:
    """
    ReviewController is a class that handles the review-related endpoints.
    """
    def __init__(self, db: Session = Depends(get_session)):
        """
        Initialize the ReviewController.
        """
        self.db = db
        self.book_id: int = 0


    def set_book_id(self, book_id: int):
        """
        Set the book ID for the review.

        :param book_id: The ID of the book.
        """
        self.book_id = book_id

    def _get_book_reviews_query(self):
        """
        Get the reviews for the book.

        :return: A list of reviews for the book.
        """
        if self.book_id == 0:
            raise ValueError("Book ID is not set.")

        reviews_query = select(
            ReviewModel.id,
            ReviewModel.book_id,
            ReviewModel.review_title,
            ReviewModel.review_details,
            ReviewModel.review_date,
            ReviewModel.rating_star
        ).where(ReviewModel.book_id == self.book_id)
        return reviews_query


    def get_book_reviews_list(self, offset: int = 0, limit: int = 100, rating_star: int = None, is_desc: bool = True) -> List:
        """
        Get reviews for a specific product.

        :param book_id: The ID of the product to get reviews for.
        :param rating_star: The rating star to filter reviews by.
        :param offset: The offset for pagination.
        :param limit: The limit for pagination.
        :param is_desc: Whether to sort the reviews in descending order.
        :return: A list of reviews for the specified product.
        """
        query = self._get_book_reviews_query()

        query = query.where(ReviewModel.rating_star == rating_star) if rating_star else query
        query = query.order_by(ReviewModel.review_date.desc() if is_desc else ReviewModel.review_date.asc())

        reviews = self.db.exec(query.offset(offset).limit(limit)).all()

        # Create ReviewResponse objects from ReviewModel objects
        return [
            ReviewResponse(
                id=review.id,
                book_id=review.book_id,
                review_title=review.review_title,
                review_details=review.review_details,
                review_date=review.review_date,
                rating_star=review.rating_star
            )
            for review in reviews
        ]


    def get_book_rating_general(self) -> Dict:
        """
        Get the general rating for a specific product including average star, number of each rating star and number of reviews.
        :return: A dictionary containing the average star, number of each rating star and number of reviews.
        """
        if self.book_id == 0:
            raise status.HTTPException(status_code=404, detail="Book ID is not set.")
        query = select(
            ReviewModel.rating_star,
            func.count(ReviewModel.rating_star).label("number_of_rating_star")
        ).where(
            ReviewModel.book_id == self.book_id
        ).group_by(
            ReviewModel.rating_star
        )

        reviews = self.db.exec(query).all()

        total_reviews = sum(r.number_of_rating_star for r in reviews)
        average_rating = (
            sum(r.rating_star * r.number_of_rating_star for r in reviews) / total_reviews
            if total_reviews > 0 else 0
        )

        return {
            "average_rating": round(average_rating, 2),
            "stars_count": {r.rating_star: r.number_of_rating_star for r in reviews},
            "total_reviews": total_reviews
        }

    def add_review(self, review_data: ReviewCreate) -> Optional[ReviewResponse]:
        """
        Add a review for a specific product.

        :param book_id: The ID of the product to add a review for.
        :param review_data: The data of the review to add.
        :return: The added review.
        """
        now = datetime.now(timezone.utc)
        new_review = ReviewModel(
            book_id=self.book_id,
            review_title=review_data.review_title,
            review_details=review_data.review_details,
            rating_star=review_data.rating_star,
            review_date = datetime.now(timezone.utc)
        )

        self.db.add(new_review)
        self.db.commit()
        self.db.refresh(new_review)
        return ReviewResponse(
            id=new_review.id,
            book_id=new_review.book_id,
            review_title=new_review.review_title,
            review_details=new_review.review_details,
            review_date=new_review.review_date,
            rating_star=new_review.rating_star
        )
