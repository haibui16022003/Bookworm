from fastapi import Depends, HTTPException
from typing import List, Optional, Dict, Tuple, Any
from datetime import date
from sqlalchemy import select, and_, or_, func
from sqlmodel import Session, SQLModel

from app.models import BookModel, AuthorModel, DiscountModel, CategoryModel, ReviewModel
from app.schema.BookSchema import BookResponse
from app.db.session import get_session


class BookController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db
        self.today = date.today()

    def _build_book_response(self, book: tuple) -> BookResponse:
        """Helper function to build a BookResponse object."""
        if len(book) == 8 and isinstance(book[7], (int, float)):
            # Format: (id, title, summary, price, cover, author, category, current_price)
            book_id, book_title, book_summary, book_price, book_cover_photo, author_name, category_name, current_price = book
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
        else:
            # Original format: (id, title, summary, price, cover, author, category)
            book_id, book_title, book_summary, book_price, book_cover_photo, author_name, category_name = book[:7]

            # Query all active discounts for the book
            current_price = self._get_current_price(book_id, book_price)

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

    def _get_current_price(self, book_id: int, original_price: float) -> float:
        """Helper function to get the current price considering active discounts."""
        discount_query = select(DiscountModel).where(
            and_(
                DiscountModel.book_id == book_id,
                DiscountModel.discount_start_date <= self.today,
                DiscountModel.discount_end_date >= self.today,
            )
        )
        discounts = self.db.exec(discount_query).scalars().all()

        # Find the lowest price among all active discounts
        if discounts:
            discount_prices = [discount.discount_price for discount in discounts]
            return min(discount_prices)
        return original_price

    def _get_base_book_query(self):
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

    def _get_discount_subquery(self):
        """Helper function to create discount subquery."""
        return (
            select(
                DiscountModel.book_id,
                func.min(DiscountModel.discount_price).label("min_discount_price")
            )
            .where(
                and_(
                    DiscountModel.discount_start_date <= self.today,
                    DiscountModel.discount_end_date >= self.today,
                )
            )
            .group_by(DiscountModel.book_id)
            .subquery()
        )

    def _get_rating_subquery(self, min_stars: int):
        """Helper function to create rating subquery."""
        return (
            select(
                ReviewModel.book_id,
                func.avg(ReviewModel.rating_star).label("avg_rating")
            )
            .group_by(ReviewModel.book_id)
            .having(func.avg(ReviewModel.rating_star) >= min_stars)
            .subquery()
        )

    def _apply_filters(self, query, count_query, category_id=None, author_id=None, min_stars=None):
        """Helper function to apply common filters to queries."""
        # Apply basic filters
        if category_id:
            query = query.where(BookModel.category_id == category_id)
            count_query = count_query.where(BookModel.category_id == category_id)
        if author_id:
            query = query.where(BookModel.author_id == author_id)
            count_query = count_query.where(BookModel.author_id == author_id)

        # Apply star rating filter if provided
        if min_stars is not None:
            rated_books_subquery = self._get_rating_subquery(min_stars)

            query = query.join(
                rated_books_subquery,
                BookModel.id == rated_books_subquery.c.book_id
            )

            count_query = count_query.join(
                rated_books_subquery,
                BookModel.id == rated_books_subquery.c.book_id
            )

        return query, count_query

    def _paginate_results(self, query, count_query, offset: int = 0, limit: int = 100) -> Dict:
        """Helper function to paginate results and format response."""
        total = self.db.exec(count_query).scalar_one()
        books = self.db.exec(query.offset(offset).limit(limit)).all()

        data = [self._build_book_response(book) for book in books]

        page_num = offset // limit + 1
        return {
            "page_num": page_num,
            "total": total,
            "data": data,
        }

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
        Get all books with optional filters and sorting options.
        """
        # Create discount subquery for price calculation
        discount_subquery = self._get_discount_subquery()

        # Create main query with book data and current price calculation
        query = (
            select(
                BookModel.id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
                CategoryModel.category_name,
                func.coalesce(discount_subquery.c.min_discount_price, BookModel.book_price).label("current_price")
            )
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
            .join(CategoryModel, BookModel.category_id == CategoryModel.id)
            .outerjoin(discount_subquery, BookModel.id == discount_subquery.c.book_id)
        )

        count_query = select(func.count()).select_from(BookModel)

        # Apply filters
        query, count_query = self._apply_filters(query, count_query, category_id, author_id, min_stars)

        # Apply price sorting based on calculated current_price
        if desc_price is not None:
            sort_direction = func.coalesce(discount_subquery.c.min_discount_price,
                                           BookModel.book_price).desc() if desc_price else func.coalesce(
                discount_subquery.c.min_discount_price, BookModel.book_price).asc()
            query = query.order_by(sort_direction)
        else:
            query = query.order_by(BookModel.id)

        # Paginate and return results
        return self._paginate_results(query, count_query, offset, limit)

    def get_book_by_id(self, book_id: int) -> Optional[BookResponse]:
        """
        Get a book by its ID.
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
        """
        # Get IDs of books with active discounts
        discount_query = (
            select(DiscountModel.book_id)
            .where(
                and_(
                    DiscountModel.discount_start_date <= self.today,
                    DiscountModel.discount_end_date >= self.today,
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

        # Apply filters
        query, count_query = self._apply_filters(query, count_query, category_id, author_id, min_stars)

        # Order by ID
        query = query.order_by(BookModel.id)

        # Paginate and return results
        return self._paginate_results(query, count_query, offset, limit)

    def search_books(self, query_term: str, offset: int = 0, limit: int = 100) -> Dict:
        """
        Search for books by title or author name.
        """
        pattern = f"%{query_term}%"

        # Build main query
        query = self._get_base_book_query().where(
            or_(
                BookModel.book_title.ilike(pattern),
                AuthorModel.author_name.ilike(pattern),
            )
        )

        # Build count query for pagination
        count_query = select(func.count()).select_from(BookModel).join(
            AuthorModel, BookModel.author_id == AuthorModel.id
        ).where(
            or_(
                BookModel.book_title.ilike(pattern),
                AuthorModel.author_name.ilike(pattern),
            )
        )

        # Paginate and return results
        return self._paginate_results(query, count_query, offset, limit)

    def get_book_price(self, book_id: int, quantity: int) -> Dict:
        """
        Get the price of a book by its ID and quantity.
        """
        book_response = self.get_book_by_id(book_id)  # This will raise 404 if book not found

        total_price = book_response.current_price * quantity
        return {
            "book_id": book_id,
            "quantity": quantity,
            "total_price": total_price,
        }

    def _get_books_with_criteria(
            self,
            join_criterion,
            order_criteria,
            limit: int
    ) -> List[BookResponse]:
        """Helper function for getting books by different criteria."""
        query = (
            self._get_base_book_query()
            .join(join_criterion)
            .group_by(BookModel.id, AuthorModel.author_name, CategoryModel.category_name)
            .order_by(*order_criteria)
            .limit(limit)
        )

        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]

    def get_recommended_books(self, limit: int = 8) -> List[BookResponse]:
        """
        Get recommended books based on highest average rating and lowest price.
        """
        return self._get_books_with_criteria(
            join_criterion=ReviewModel,
            order_criteria=[func.avg(ReviewModel.rating_star).desc(), BookModel.book_price.asc()],
            limit=limit
        )

    def get_popular_books(self, limit: int = 8) -> List[BookResponse]:
        """
        Get popular books based on most reviews and lowest price.
        """
        return self._get_books_with_criteria(
            join_criterion=ReviewModel,
            order_criteria=[func.count(ReviewModel.id).desc(), BookModel.book_price.asc()],
            limit=limit
        )

    def get_top_discounted_books(self, limit: int = 10) -> List[BookResponse]:
        """
        Get books with the highest discount amount (book_price - discount_price).
        """
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
                    DiscountModel.discount_start_date <= self.today,
                    DiscountModel.discount_end_date >= self.today,
                )
            )
            .group_by(BookModel.id, AuthorModel.author_name, CategoryModel.category_name)
            .order_by((BookModel.book_price - func.min(DiscountModel.discount_price)).desc())
            .limit(limit)
        )

        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]