from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional, Dict

from app.controllers.BookController import BookController
from app.schema.BookSchema import BookResponse


router = APIRouter(prefix="/books", tags=["Books"])

@router.get("/", response_model=Dict)
async def get_books(
    offset: int = Query(0, description="Offset for pagination"),
    limit: int = Query(10, description="Limit for pagination"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    desc_price: bool = Query(None, description="Sort by price descending"),
    min_stars: Optional[int] = Query(None, description="Filter by minimum star rating (1-5)"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get all books with optional filters for category, author, and minimum star rating.
    :param offset: Offset for pagination
    :param limit: Page size
    :param category_id: Filter by category ID
    :param author_id: Filter by category ID
    :param desc_price: Sort by price descending
    :param min_stars: Filter by minimum star rating (1-5)
    :param book_controller: BookController dependency
    :return: Dictionary containing page number, total books, and list of BookResponse objects
    """
    response = book_controller.get_all_books(
        offset=offset, limit=limit, category_id=category_id, author_id=author_id, 
        desc_price=desc_price, min_stars=min_stars
    )
    return response


@router.get("/discounts", response_model=Dict)
async def get_discount_books(
    offset: int = Query(0, description="Offset for pagination"),
    limit: int = Query(10, description="Limit for pagination"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    min_stars: Optional[int] = Query(None, description="Filter by minimum star rating (1-5)"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get all books that are currently on discount.
    :param offset: Offset for pagination
    :param limit: Page size
    :param category_id: Filter by category ID
    :param author_id: Filter by author ID
    :param min_stars: Filter by minimum star rating (1-5)
    :param book_controller: BookController dependency
    :return: Dictionary containing page number, total books, and list of BookResponse objects
    """
    books = book_controller.get_discount_books(
        offset=offset,
        limit=limit,
        category_id=category_id,
        author_id=author_id,
        min_stars=min_stars,
    )
    return books


@router.get("/top-discounted", response_model=List[BookResponse])
async def get_top_discounted_books(
    limit: int = Query(10, description="Number of books to return"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get top books with the highest discount amount (book_price - discount_price).
    :param limit: Number of books to return (default 10)
    :param book_controller: BookController dependency
    :return: List of BookResponse objects with the highest discount amount
    """
    books = book_controller.get_top_discounted_books(limit=limit)
    return books


@router.get("/recommended", response_model=List[BookResponse])
async def get_recommended_books(
    limit: int = Query(8, description="Number of recommended books to return"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get recommended books based on highest average rating and lowest price.
    :param limit: Number of books to return (default 8)
    :param book_controller: BookController dependency
    :return: List of BookResponse objects
    """
    books = book_controller.get_recommended_books(limit=limit)
    return books


@router.get("/popular", response_model=List[BookResponse])
async def get_popular_books(
    limit: int = Query(8, description="Number of popular books to return"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get popular books based on most reviews and lowest price.
    :param limit: Number of books to return (default 8)
    :param book_controller: BookController dependency
    :return: List of BookResponse objects
    """
    books = book_controller.get_popular_books(limit=limit)
    return books


@router.get("/search", response_model=List[BookResponse])
async def search_books(
    query: str,
    offset: int = Query(0, description="Offset for pagination"),
    limit: int = Query(10, description="Limit for pagination"),
    book_controller: BookController = Depends(BookController),
):
    """
    Search for books by title or summary.
    :param query: Search query
    :param offset: Offset for pagination
    :param limit: Page size
    :param book_controller: BookController dependency
    :return: List of BookResponse objects
    """
    books = book_controller.search_books(query_term=query, offset=offset, limit=limit)
    return books


@router.get("/{book_id}", response_model=BookResponse)
async def get_book_by_id(
    book_id: int,
    book_controller: BookController = Depends(BookController),
):
    """
    Get a book by its ID.
    :param book_id: The ID of the book to retrieve
    :param book_controller: BookController dependency
    :return: BookResponse object
    :raises HTTPException: If the book with the given ID is not found
    """
    book = book_controller.get_book_by_id(book_id)
    return book
