from pydantic import BaseModel, Field
from datetime import datetime, timezone

from app.models.OrderModel import OrderModel, OrderItemModel

class OrderSchema(BaseModel):
    """
    Order Base Schema
    """
    user_id: int = Field(..., gt=0)
    order_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    order_amount: float = Field(..., gt=0)


class OrderItemSchema(BaseModel):
    """
    Order Item Base Schema
    """
    order_id: int = Field(..., gt=0)
    book_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)


