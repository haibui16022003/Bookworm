from pydantic import BaseModel, Field

class UserSchema(BaseModel):
    """User Base Schema"""
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., min_length=1, max_length=70)

class UserCreate(UserSchema):
    """User Create Schema"""
    password: str = Field(..., min_length=8, max_length=16)
    is_admin: bool = False

class UserRegister(UserSchema):
    """User Register Schema"""
    password: str = Field(..., min_length=8, max_length=16)

class UserResponse(UserSchema):
    """User Response Schema"""
    id: int
    is_admin: bool = False

class UserUpdate(UserSchema):
    """User Update Schema"""
    password: str = Field(..., min_length=8, max_length=16)
