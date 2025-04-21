from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import CategoryModel
from app.schema.CategorySchema import CategoryResponse, CategoryCreate, CategoryUpdate

class CategoryController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db


    def _check_existing_category(self, category_name: str) -> bool:
        """
        Check if a category with the given name already exists in the database.
        :param category_name: Name of the category to check
        :return: True if category exists, False otherwise
        """
        existing_category = self.db.exec(
            select(CategoryModel).where(CategoryModel.category_name == category_name)
        ).first()
        return existing_category is not None

    def create_category(self, category_data: CategoryCreate) -> CategoryResponse:
        """
        Create a new category in the database.
        :param category_data: CategoryCreate object containing category details
        :return: CategoryResponse object with the created category details
        """
        if self._check_existing_category(category_data.category_name):
            raise HTTPException(status_code=400, detail="Category already exists")

        new_category = CategoryModel(**category_data.model_dump())
        self.db.add(new_category)
        self.db.commit()
        self.db.refresh(new_category)
        return CategoryResponse(
            id=new_category.id,
            category_name=new_category.category_name,
            category_desc=new_category.category_desc
        )

    def get_category(self) -> List[CategoryResponse]:
        """
        Get all category.
        :return: List of CategoryResponse objects
        """
        categories = self.db.exec(select(CategoryModel)).all()
        return [
            CategoryResponse(
                id=category.id,
                category_name=category.category_name,
                category_desc=category.category_desc,
            )
            for category in categories
        ]


    def update_category(self, category_id: int, category_data: CategoryUpdate) -> CategoryResponse:
        category = self.db.get(CategoryModel, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        if category_data.category_name != category.category_name and self._check_existing_category(category_data.category_name):
            raise HTTPException(status_code=400, detail="Category already exists")

        category.category_name = category_data.category_name
        category.category_desc = category_data.category_desc
        self.db.commit()
        self.db.refresh(category)

        return CategoryResponse(
            id=category.id,
            category_name=category.category_name,
            category_desc=category.category_desc,
        )

    def delete_category(self, category_id: int) -> None:
        category = self.db.get(CategoryModel, category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        self.db.delete(category)
        self.db.commit()
        