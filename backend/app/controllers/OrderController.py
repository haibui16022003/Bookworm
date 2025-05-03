from fastapi import  Depends, HTTPException
from sqlmodel import Session
from datetime import datetime, timezone

from app.models.OrderModel import OrderModel, OrderItemModel
from app.schema.OrderSchema import OrderItemSchema, OrderResponse, OrderCreate
from app.db.session import get_session


class OrderController:
    """
    Order Controller
    """

    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def create_order(self, order: OrderCreate) -> OrderResponse:
        # Create the order first
        new_order = OrderModel(
            user_id=order.user_id,
            order_date=datetime.now(timezone.utc),
            order_amount=order.order_amount
        )

        # Add and commit to get the ID
        self.db.add(new_order)
        self.db.commit()
        self.db.refresh(new_order)

        new_order_items = []
        for item in order.order_items:
            new_order_item = OrderItemModel(
                order_id=new_order.id,
                book_id=item.book_id,
                quantity=item.quantity,
                price=item.price
            )
            new_order_items.append(new_order_item)
            self.db.add(new_order_item)

        self.db.commit()

        # Explicitly create OrderItemSchema objects with required fields
        order_items_schema = [
            OrderItemSchema(
                book_id=item.book_id,
                quantity=item.quantity,
                price=item.price
            ) for item in new_order_items
        ]

        return OrderResponse(
            id=new_order.id,
            user_id=new_order.user_id,
            order_date=new_order.order_date,
            order_amount=new_order.order_amount,
            order_items=order_items_schema
        )


    def get_order_by_id(self, order_id: int) -> OrderResponse:
        """
        Get an order by ID.
        :param order_id: ID of the order to retrieve
        :return: OrderResponse object
        """
        order = self.db.query(OrderModel).where(OrderModel.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        order_items = self.db.query(OrderItemModel).where(OrderItemModel.order_id == order_id).all()
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            order_date=order.order_date,
            order_amount=order.order_amount,
            order_items=[OrderItemSchema(**item.__dict__) for item in order_items]
        )

