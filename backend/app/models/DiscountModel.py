from datetime import date
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BIGINT, DATE, Numeric

class DiscountModel(SQLModel, table=True):
    __tablename__ = "discount"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    book_id: int = Field(sa_column=Column(BIGINT, foreign_key="book.id"))
    discount_start_date: date = Field(sa_column=Column(DATE))
    discount_end_date: date = Field(sa_column=Column(DATE))
    discount_price: float = Field(sa_column=Column(Numeric(5, 2)))

