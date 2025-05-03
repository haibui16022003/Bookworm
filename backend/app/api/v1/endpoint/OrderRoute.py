from fastapi import APIRouter, Depends
from typing import List

from app.controllers.OrderController import OrderController
from app.schema.OrderSchema import OrderResponse, OrderCreate

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    order_controller: OrderController = Depends(OrderController),
):
    """
    Create a new order.
    :param order_data: OrderCreate object containing order details
    :param order_controller: OrderController dependency
    :return: OrderResponse object with the created order details
    """
    print(order_data)
    return order_controller.create_order(order_data)


@router.get("/{order_id}", response_model=List[OrderResponse])
async def get_orders(
    order_id: int,
    order_controller: OrderController = Depends(OrderController),
):
    """
    Get order by id.
    :param order_id: ID of the order to retrieve
    :param order_controller: OrderController dependency
    :return: List of OrderResponse objects
    """
    return order_controller.get_order_by_id(order_id=order_id)