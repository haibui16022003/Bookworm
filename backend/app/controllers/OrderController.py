from fastapi import  Depends, HTTPException
from typing import Dict, List

from app.models.OrderModel import OrderModel, OrderItemModel
from app.schema.OrderSchema import OrderSchema, OrderItemSchema

class OrderController:
    """
    Order Controller
    """
    def __init__(self, db_session):
        self.db = db_session

    def create_order(self, order: OrderSchema) -> OrderModel:
        """
        Create a new order.
        :param order: OrderSchema object
        :return: Created OrderModel object
        """
        order_model = OrderModel(**order.dict())
        self.db.add(order_model)
        self.db.commit()
        self.db.refresh(order_model)
        return order_model

    def get_order_by_id(self, order_id: int) -> OrderModel:
        """
        Get an order by ID.
        :param order_id: ID of the order to retrieve
        :return: OrderModel object
        """
        order = self.db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def get_user_orders(self, user_id: int) -> List[OrderModel]:
        """
        Get all orders for a specific user.
        :param user_id: ID of the user to retrieve orders for
        :return: List of OrderModel objects
        """
        orders = self.db.query(OrderModel).filter(OrderModel.user_id == user_id).all()
        return orders

    def add_order_item(self, order_item: OrderItemSchema) -> OrderItemModel:
        """
        Add an item to an existing order.
        :param order_item: OrderItemSchema object
        :return: Created OrderItemModel object
        """
        order_item_model = OrderItemModel(**order_item.dict())
        self.db.add(order_item_model)
        self.db.commit()
        self.db.refresh(order_item_model)
        return order_item_model

    def get_order_items(self, order_id: int) -> List[OrderItemModel]:
        """
        Get all items for a specific order.
        :param order_id: ID of the order to retrieve items for
        :return: List of OrderItemModel objects
        """
        items = self.db.query(OrderItemModel).filter(OrderItemModel.order_id == order_id).all()
        return items