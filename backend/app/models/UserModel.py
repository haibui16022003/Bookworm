from sqlmodel import SQLModel, Field
from sqlalchemy import Column, BIGINT, VARCHAR, Boolean

class UserModel(SQLModel, table=True):
    __tablename__ = "user"

    id: int = Field(sa_column=Column(BIGINT, primary_key=True, autoincrement=True))
    first_name: str = Field(Column(VARCHAR(50)))
    last_name: str = Field(Column(VARCHAR(50)))
    email: str = Field(sa_column=Column(VARCHAR(70), unique=True))
    password: str = Field(sa_column=Column(VARCHAR(255)))
    admin: bool = Field(sa_column=Column(Boolean, default=False))


