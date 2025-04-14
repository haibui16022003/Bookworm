from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BIGINT, VARCHAR, Text

class AuthorModel(SQLModel, table=True):
    __tablename__ = "author"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    author_name: str = Field(sa_column=Column(VARCHAR(255)))
    author_bio: str = Field(sa_column=Column(Text))
