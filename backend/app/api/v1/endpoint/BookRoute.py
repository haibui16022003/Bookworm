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
    desc_price: bool = Query(False, description="Sort by price descending"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get all books with optional filters for category and author.
    :param offset: Offset for pagination
    :param limit: Page size
    :param category_id: Filter by category ID
    :param author_id: Filter by author ID
    :param desc_price: Sort by price descending
    :param book_controller: BookController dependency
    :return: Dictionary containing page number, total books, and list of BookResponse objects
    """
    response = book_controller.get_all_books(
        offset=offset, limit=limit, category_id=category_id, author_id=author_id, desc_price=desc_price
    )
    return response


@router.get("/discounts", response_model=Dict)
async def get_discount_books(
    offset: int = Query(0, description="Offset for pagination"),
    limit: int = Query(10, description="Limit for pagination"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    book_controller: BookController = Depends(BookController),
):
    """
    Get all books that are currently on discount.
    :param offset: Offset for pagination
    :param limit: Page size
    :param category_id: Filter by category ID
    :param author_id: Filter by author ID
    :param book_controller: BookController dependency
    :return: Dictionary containing page number, total books, and list of BookResponse objects
    """
    books = book_controller.get_discount_books(
        offset=offset,
        limit=limit,
        category_id=category_id,
        author_id=author_id,
    )
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

