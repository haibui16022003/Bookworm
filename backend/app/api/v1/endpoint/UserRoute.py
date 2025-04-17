from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from typing import Optional, Dict, List
from sqlmodel import Session

from app.controllers.UserController import UserController
from app.schema.UserSchema import UserResponse, UserUpdate, UserCreate
from app.db.session import get_session
from app.utils.middlewares.JWTMiddleware import admin_access


router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse)
@admin_access(admin_required=True)
async def create_user(
    user_data: UserCreate,
    user_controller: UserController = Depends()
) -> Optional[UserResponse]:
    """
    Create a new user in the database. (Administrator only)
    :param user_data: User data to create a new user
    :param user_controller: UserController dependency
    :return: UserResponse object with the created user's details
    """
    return user_controller.create_user(user_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    request: Request,
) :
    """
    Get the current user from the token.
    :param request: Request with authenticated user
    :return: UserResponse object with the current user's details
    """
    return request.state.user


@router.get("/{user_id}", response_model=UserResponse)
@admin_access(admin_required=True)
async def get_current_user_by_id(
    user_id: int,
    user_controller: UserController = Depends()
) -> Optional[UserResponse]:
    """
    Get a user by ID. (Administrator only)
    :param user_id: ID of the user to retrieve
    :param user_controller: UserController dependency
    :return: UserResponse object with the user's details
    """
    return user_controller.get_user_by_id(user_id=user_id)


@router.get("/", response_model=List[UserResponse])
@admin_access(admin_required=True)
async def get_all_user(
    request: Request,
    user_controller: UserController = Depends()
):
    """
    Get all users in the database. (Administrator only)
    :return: List of UserResponse objects with all users' details
    """
    return user_controller.get_all_users()


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    request: Request,
    user_data: UserUpdate,
    user_controller: UserController = Depends()
):
    """
    Update the current user's information.
    :param request: Request with authenticated user
    :param user_data: UserUpdate object containing updated user details
    :param user_controller: UserController dependency
    :return: UserResponse object with the updated user's details
    """
    current_user = request.state.user
    return user_controller.update_user(
        user_id=current_user.id,
        old_password=user_data.old_password,
        data=user_data
    )


@router.patch("/me", response_model=UserResponse)
async def update_current_user_password(
    request: Request,
    old_password: str,
    new_password: str,
    user_controller: UserController = Depends()
):
    """
    Update the current user's password.
    :param request: Request with authenticated user
    :param old_password: User's old password for verification
    :param new_password: User's new password
    :param user_controller: UserController dependency
    :return: UserResponse object with the updated user's details
    """
    current_user = request.state.user
    return user_controller.update_password(
        user_id=current_user.id,
        old_password=old_password,
        new_password=new_password
    )


@router.delete("/{user_id}", response_model=UserResponse)
async def delete_current_user():
    pass


