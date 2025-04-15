from fastapi import Depends, HTTPException
from typing import List, Optional
from datetime import date
from sqlalchemy import select, and_, or_
from sqlmodel import Session, SQLModel

from app.models import BookModel, AuthorModel, DiscountModel
from app.schema.BookSchema import BookResponse
from app.db.session import get_session


class BookController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db


    def _build_book_response(self, book: tuple) -> BookResponse:
        """Helper function to build a BookResponse object."""
        (
            book_id,
            book_category_id,
            book_title,
            book_summary,
            book_price,
            book_cover_photo,
            author_name,
        ) = book
        today = date.today()
        discount_query = select(DiscountModel).where(
            and_(
                DiscountModel.book_id == book_id,
                DiscountModel.discount_start_date <= today,
                DiscountModel.discount_end_date >= today,
            )
        )
        discount = self.db.exec(discount_query).scalars().first()
        current_price = discount.discount_price if discount else book_price
        return BookResponse(
            id=book_id,
            category_id = book_category_id,
            book_title=book_title,
            book_summary=book_summary,
            original_price=book_price,
            current_price=current_price,
            book_cover_photo=book_cover_photo,
            author_name=author_name,
        )


    @staticmethod
    def _get_base_book_query() -> SQLModel:
        """Helper function to get the base book query with author join."""
        return (
            select(
                BookModel.id,
                BookModel.category_id,
                BookModel.book_title,
                BookModel.book_summary,
                BookModel.book_price,
                BookModel.book_cover_photo,
                AuthorModel.author_name,
            )
            .join(AuthorModel, BookModel.author_id == AuthorModel.id)
        )


    def get_all_books(
        self,
        offset: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        author_id: Optional[int] = None,
    ) -> List[BookResponse]:
        """
        Get all books with optional filters for category and author.
        :param offset: Book offset for pagination
        :param limit: page size
        :param category_id: filter by category id
        :param author_id: filter by author id
        :return: List of BookResponse objects
        """
        query = self._get_base_book_query()

        if category_id:
            query = query.where(BookModel.category_id == category_id)
        if author_id:
            query = query.where(BookModel.author_id == author_id)

        books = self.db.exec(query.offset(offset).limit(limit)).all()
        return [self._build_book_response(book) for book in books]

    def get_book_by_id(self, book_id: int) -> BookResponse:
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

    def get_discount_books(self, offset: int = 0, limit: int = 100) -> List[BookResponse]:
        """
        Get all books that are currently on discount.
        :param offset: Book offset for pagination
        :param limit: page size
        :return: List of BookResponse objects
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
            .offset(offset)
            .limit(limit)
        )
        discounted_book_ids = [row[0] for row in self.db.exec(discount_query).all()]
        if not discounted_book_ids:
            return []

        query = self._get_base_book_query().where(BookModel.id.in_(discounted_book_ids))
        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]


    def search_books(self, query_term: str, offset: int = 0, limit: int = 100) -> List[BookResponse]:
        """
        Search for books by title or author name.
        :param query_term: Book title or author name to search for
        :param offset: Book offset for pagination
        :param limit: page size
        :return: List of BookResponse objects
        """
        pattern = f"%{query_term}%"
        query = self._get_base_book_query().where(
            or_(
                BookModel.book_title.ilike(pattern),
                AuthorModel.author_name.ilike(pattern),
            )
        ).offset(offset).limit(limit)

        books = self.db.exec(query).all()
        return [self._build_book_response(book) for book in books]
