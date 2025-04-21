from fastapi import APIRouter, Depends
from typing import List

from app.controllers.CategoryController import CategoryController
from app.schema.CategorySchema import CategoryResponse, CategoryCreate, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    category_controller: CategoryController = Depends(CategoryController),
):
    """
    Create a new category.
    :param category_data: CategoryCreate object containing category details
    :param category_controller: CategoryController dependency
    :return: CategoryResponse object with the created category details
    """
    return category_controller.create_category(category_data)


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    category_controller: CategoryController = Depends(CategoryController),
):
    """
    Get all categories.
    :param category_controller: CategoryController dependency
    :return: List of CategoryResponse objects
    """
    return category_controller.get_category()


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    category_controller: CategoryController = Depends(CategoryController),
):
    """
    Update an existing category.
    :param category_id: ID of the category to update
    :param category_data: CategoryUpdate object containing updated category details
    :param category_controller: CategoryController dependency
    :return: CategoryResponse object with the updated category details
    """
    return category_controller.update_category(category_id, category_data)


@router.delete("/{category_id}", response_model=CategoryResponse)
async def delete_category(
    category_id: int,
    category_controller: CategoryController = Depends(CategoryController),
):
    """
    Delete an existing category.
    :param category_id: ID of the category to delete
    :param category_controller: CategoryController dependency
    :return: CategoryResponse object with the deleted category details
    """
    return category_controller.delete_category(category_id)