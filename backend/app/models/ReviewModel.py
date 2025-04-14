from datetime import datetime, timezone
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BIGINT, Text

class ReviewModel(SQLModel, table=True):
    __tablename__ = "review"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    book_id: int = Field(sa_column=Column(BIGINT, foreign_key="book.id"))
    review_title: str = Field(max_length=100)
    review_details: str = Field(sa_column=Column(Text))
    review_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rating_start: str = Field(max_length=255)
