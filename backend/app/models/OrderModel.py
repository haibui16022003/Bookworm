from sqlmodel import SQLModel, Field
from datetime import datetime
from sqlalchemy import Column, BIGINT, DATE, Numeric, SMALLINT

class OrderModel(SQLModel, table=True):
    __tablename__ = "order"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    user_id: int = Field(foreign_key="user.id")
    order_date: datetime = Field(sa_column=Column(DATE))
    order_amount: float = Field(sa_column=Column(Numeric(8, 2))) # Total price of the order


class OrderItemModel(SQLModel, table=True):
    __tablename__ = "order_item"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    order_id: int = Field(foreign_key="order.id")
    book_id: int = Field(foreign_key="book.id")
    quantity: int = Field(sa_column=Column(SMALLINT))
    price: float = Field(sa_column=Column(Numeric(5, 2)))
