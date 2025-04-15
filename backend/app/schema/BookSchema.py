from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class BookSchema(BaseModel):
    """Book Base Schema"""
    category_id: int = Field(..., gt=0)
    book_title: str = Field(..., min_length=1, max_length=255)
    book_summary: str
    book_cover_photo: str
    original_price: float = Field(..., gt=0)


class BookResponse(BookSchema):
    """Book Response Schema"""
    id: int
    current_price: float = Field(..., gt=0)
    author_name: str


class BookCreate(BookSchema):
    """Book Create Schema"""
    book_price: float = Field(..., gt=0)
    author_id: int = Field(..., gt=0)


class BookUpdate(BookSchema):
    """Book Update Schema"""
    pass
