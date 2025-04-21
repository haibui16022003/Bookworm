from pydantic import BaseModel, Field

class CategorySchema(BaseModel):
    category_name: str = Field(..., title="Category Name", description="Name of the category")
    category_desc: str | None = Field(None, title="Category Description", description="Description of the category")


class CategoryResponse(CategorySchema):
    id: int = Field(..., title="Category ID", description="Unique identifier for the category")


class CategoryCreate(CategorySchema):
    pass


class CategoryUpdate(CategorySchema):
    pass