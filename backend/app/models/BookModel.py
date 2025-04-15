from typing import Optional
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Numeric, Text, BIGINT, VARCHAR

class BookModel(SQLModel, table=True):
    __tablename__ = "book"

    id: Optional[int] = Field(
        sa_column=Column(BIGINT, primary_key=True, autoincrement=True)
    )
    category_id: int = Field(foreign_key="category.id")
    author_id: int = Field(foreign_key="author.id")
    book_title: str = Field(sa_column=Column(VARCHAR(255)))
    book_summary: str = Field(sa_column=Column(Text))
    book_price: float = Field(sa_column=Column(Numeric(5, 2)))
    book_cover_photo: str = Field(sa_column=Column(VARCHAR(20)))