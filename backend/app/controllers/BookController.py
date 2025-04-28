from fastapi import Depends, HTTPException
from typing import List, Optional, Dict
from datetime import date
from sqlalchemy import select, and_, or_, func
from sqlmodel import Session, SQLModel

from app.models import BookModel, AuthorModel, DiscountModel, CategoryModel, ReviewModel
from app.schema.BookSchema import BookResponse
from app.db.session import get_session


class BookController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def _build_book_response(self, book: tuple) -> BookResponse:
        """Helper function to build a BookResponse object."""
        book_id, book_title, book_summary, book_price, book_cover_photo, author_name, category_name = book[:7]
        today = date.today()

        # Query all active discounts for the book
        discount_query = select(DiscountModel).where(
            and_(
                DiscountModel.book_id == book_id,
                DiscountModel.discount_start_date <= today,
                DiscountModel.discount_end_date >= today,
            )
        )
        discounts = self.db.exec(discount_query).scalars().all()

        # Find the lowest price among all active discounts
        current_price = book_price
        if discounts:
            discount_prices = [discount.discount_price for discount in discounts]
            current_price = min(discount_prices)

        return BookResponse(
            id=book_id,
            book_title=book_title,
            book_summary=book_summary,
            original_price=book_price,
            current_price=current_price,
            book_cover_photo=book_cover_photo,
            author_name=author_name,
            category_name=category_name
        )

    @staticmethod
    def _get_base_book_query():
        """Helper function to get the base book query with author join."""
        return (
            select(
                BookModel.id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
                CategoryModel.category_name
            )
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
            .join(CategoryModel, BookModel.category_id == CategoryModel.id)
        )

    def get_all_books(
            self,
            offset: int = 0,
            limit: int = 100,
            category_id: Optional[int] = None,
            author_id: Optional[int] = None,
            desc_price: Optional[bool] = None,
            min_stars: Optional[int] = None
    ) -> Dict:
        """
        Get all books with optional filters for category, author, and minimum star rating.
        :param offset: Book offset for pagination
        :param limit: page size
        :param category_id: filter by category id
        :param author_id: filter by author id
        :param desc_price: sort by price descending
        :param min_stars: filter by minimum star rating
        :return: Dictionary containing page number, total books, and list of BookResponse objects
        """
        base_query = self._get_base_book_query()
        count_query = select(func.count()).select_from(BookModel)
        
        # Apply basic filters
        if category_id:
            base_query = base_query.where(BookModel.category_id == category_id)
            count_query = count_query.where(BookModel.category_id == category_id)
        if author_id:
            base_query = base_query.where(BookModel.author_id == author_id)
            count_query = count_query.where(BookModel.author_id == author_id)
            
        # If star rating filter is applied, we need a different approach
        if min_stars is not None:
            # Get books with specified minimum average rating
            rated_books_subquery = (
                select(
                    ReviewModel.book_id,
                    func.avg(ReviewModel.rating_star).label("avg_rating")
                )
                .group_by(ReviewModel.book_id)
                .having(func.avg(ReviewModel.rating_star) >= min_stars)
                .subquery()
            )
            
            # Add the star rating filter to the main query
            base_query = base_query.join(
                rated_books_subquery,
                BookModel.id == rated_books_subquery.c.book_id
            )
            
            # Also update the count query to reflect the star rating filter
            count_query = (
                select(func.count(BookModel.id.distinct()))
                .select_from(BookModel)
                .join(
                    rated_books_subquery,
                    BookModel.id == rated_books_subquery.c.book_id
                )
            )
            
            # Reapply the other filters to the count query
            if category_id:
                count_query = count_query.where(BookModel.category_id == category_id)
            if author_id:
                count_query = count_query.where(BookModel.author_id == author_id)

        # Execute the count query to get total books matching filters
        total = self.db.exec(count_query).scalar_one()
        
        # Execute the main query to fetch books
        books = self.db.exec(base_query.order_by(BookModel.id).offset(offset).limit(limit)).all()
        
        page_num = offset // limit + 1
        data = [self._build_book_response(book) for book in books]

        if desc_price is not None:
            data.sort(key=lambda x: x.current_price, reverse=desc_price)

        return {
            "page_num": page_num,
            "total": total,
            "data": data,
        }

    def get_book_by_id(self, book_id: int) -> Optional[BookResponse]:
        """
        Get a book by its ID.
        :param book_id: The ID of the book to retrieve.
        :return: BookResponse object
        :raises HTTPException: If the book with the given ID is not found.
        """
        query = self._get_base_book_query().where(BookModel.id == book_id)
        book = self.db.exec(query).first()

        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        return self._build_book_response(book)

    def get_discount_books(
            self,
            offset: int = 0,
            limit: int = 100,
            category_id: Optional[int] = None,
            author_id: Optional[int] = None,
            min_stars: Optional[int] = None
    ) -> Dict:
        """
        Get all books that are currently on discount.
        :param offset: Book offset for pagination
        :param limit: page size
        :param category_id: filter by category id
        :param author_id: filter by author id
        :param min_stars: filter by minimum star rating
        :return: Dictionary containing page number, total books, and list of BookResponse objects
        """
        today = date.today()

        discount_query = (
            select(DiscountModel.book_id)
            .where(
                and_(
                    DiscountModel.discount_start_date <= today,
                    DiscountModel.discount_end_date >= today,
                )
            )
            .distinct()
        )
        discounted_book_ids = [row[0] for row in self.db.exec(discount_query).all()]
        if not discounted_book_ids:
            return {
                "total": 0,
                "page_num": offset // limit + 1,
                "data": [],
            }

        # Build the book query with the discounted book IDs
        query = self._get_base_book_query().where(BookModel.id.in_(discounted_book_ids))
        count_query = select(func.count(BookModel.id.distinct())).where(BookModel.id.in_(discounted_book_ids))

        # Apply category and author filters
        if category_id:
            query = query.where(BookModel.category_id == category_id)
            count_query = count_query.where(BookModel.category_id == category_id)
        if author_id:
            query = query.where(BookModel.author_id == author_id)
            count_query = count_query.where(BookModel.author_id == author_id)
            
        # Apply star rating filter if provided
        if min_stars is not None:
            rated_books_subquery = (
                select(
                    ReviewModel.book_id,
                    func.avg(ReviewModel.rating_star).label("avg_rating")
                )
                .group_by(ReviewModel.book_id)
                .having(func.avg(ReviewModel.rating_star) >= min_stars)
                .subquery()
            )
            
            query = query.join(
                rated_books_subquery,
                BookModel.id == rated_books_subquery.c.book_id
            )
            
            count_query = (
                count_query.join(
                    rated_books_subquery,
                    BookModel.id == rated_books_subquery.c.book_id
                )
            )

        # Execute queries
        total = self.db.exec(count_query).scalar_one()
        books = self.db.exec(query.order_by(BookModel.id).offset(offset).limit(limit)).all()
        data = [self._build_book_response(book) for book in books]

        page_num = offset // limit + 1
        return {
            "page_num": page_num,
            "total": total,
            "data": data,
        }

    def search_books(self, query_term: str, offset: int = 0, limit: int = 100) -> Dict:
        """
        Search for books by title or author name.
        :param query_term: Book title or author name to search for
        :param offset: Book offset for pagination
        :param limit: page size
        :return: Dictionary containing page number, total books, and list of BookResponse objects
        """
        pattern = f"%{query_term}%"
        query = self._get_base_book_query().where(
            or_(
                BookModel.book_title.ilike(pattern),
                AuthorModel.author_name.ilike(pattern),
            )
        ).offset(offset).limit(limit)

        books = self.db.exec(query).all()
        data = [self._build_book_response(book) for book in books]

        # Get total count for pagination
        count_query = select(func.count()).select_from(BookModel).join(
            AuthorModel, BookModel.author_id == AuthorModel.id
        ).where(
            or_(
                BookModel.book_title.ilike(pattern),
                AuthorModel.author_name.ilike(pattern),
            )
        )
        total = self.db.exec(count_query).scalar_one()

        page_num = offset // limit + 1
        return {
            "page_num": page_num,
            "total": total,
            "data": data,
        }

    def get_book_price(self, book_id: int, quantity: int) -> Dict:
        """
        Get the price of a book by its ID and quantity.
        :param book_id: The ID of the book
        :param quantity: The quantity of the book
        :return: The total price of the book
        """
        query = self._get_base_book_query().where(BookModel.id == book_id)
        book = self.db.exec(query).first()
        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        book = self._build_book_response(book)
        total_price = book.current_price * quantity
        return {
            "book_id": book_id,
            "quantity": quantity,
            "total_price": total_price,
        }

    def get_recommended_books(self, limit: int = 8) -> List[BookResponse]:
        """
        Get recommended books based on highest average rating and lowest price.
        :param limit: Number of books to return (default 8)
        :return: List of BookResponse objects
        """
        query = (
            select(
                BookModel.id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
                CategoryModel.category_name,
                func.avg(ReviewModel.rating_star).label("avg_rating"),
            )
            .join(ReviewModel, BookModel.id == ReviewModel.book_id)
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
            .join(CategoryModel, BookModel.category_id == CategoryModel.id)
            .group_by(BookModel.id, AuthorModel.author_name, CategoryModel.category_name)
            .order_by(func.avg(ReviewModel.rating_star).desc(), BookModel.book_price.asc())
            .limit(limit)
        )

        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]

    def get_popular_books(self, limit: int = 8) -> List[BookResponse]:
        """
        Get popular books based on most reviews and lowest price.
        :param limit: Number of books to return (default 8)
        :return: List of BookResponse objects
        """
        query = (
            select(
                BookModel.id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
                CategoryModel.category_name,
                func.count(ReviewModel.id).label("review_count"),
            )
            .join(ReviewModel, BookModel.id == ReviewModel.book_id)
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
            .join(CategoryModel, BookModel.category_id == CategoryModel.id)
            .group_by(BookModel.id, AuthorModel.author_name, CategoryModel.category_name)
            .order_by(func.count(ReviewModel.id).desc(), BookModel.book_price.asc())
            .limit(limit)
        )

        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]
        
    def get_top_discounted_books(self, limit: int = 10) -> List[BookResponse]:
        """
        Get books with the highest discount amount (book_price - discount_price).
        :param limit: Number of books to return (default 10)
        :return: List of BookResponse objects
        """
        today = date.today()
        
        # Query to find books with active discounts and calculate the discount amount
        query = (
            select(
                BookModel.id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
                CategoryModel.category_name,
                (BookModel.book_price - func.min(DiscountModel.discount_price)).label("discount_amount")
            )
            .join(DiscountModel, BookModel.id == DiscountModel.book_id)
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
            .join(CategoryModel, BookModel.category_id == CategoryModel.id)
            .where(
                and_(
                    DiscountModel.discount_start_date <= today,
                    DiscountModel.discount_end_date >= today,
                )
            )
            .group_by(BookModel.id, AuthorModel.author_name, CategoryModel.category_name)
            .order_by((BookModel.book_price - func.min(DiscountModel.discount_price)).desc())
            .limit(limit)
        )
        
        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]