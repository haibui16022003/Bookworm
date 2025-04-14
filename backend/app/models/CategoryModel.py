from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BIGINT, VARCHAR

class CategoryModel(SQLModel, table=True):
    __tablename__ = "category"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    category_name: str = Field(sa_column=Column(VARCHAR(120)))
    category_desc: str = Field(sa_column=Column(VARCHAR(255)))
