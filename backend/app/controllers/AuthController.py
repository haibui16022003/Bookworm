from typing import Optional
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.schema.UserSchema import UserRegister, UserResponse
from app.models import UserModel
from app.core.security import hash_password, authenticate_user, get_user_from_refresh_token
from app.core.security.app_token import decode_token
from app.db.session import get_session


class AuthController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def register_user(self, data: UserRegister) -> Optional[UserResponse]:
        """
        Register a new user in the database.
        :param data: Form data to register a new user
        :return: UserResponse object with the registered user's details
        """
        password = hash_password(data.password)

        # Check if user already exists
        exist_user = self.db.exec(
            select(UserModel).where(UserModel.email == data.email)
        ).first()

        if exist_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )

        new_user = UserModel(
            email=data.email,
            password=password,
            first_name=data.first_name,
            last_name=data.last_name,
        )

        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return UserResponse(
            id=new_user.id,
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            is_admin=False
        )


    def login_user(self, email: str, password: str) -> Optional[UserResponse]:
        """
        Log in a user.
        :param email: User's email
        :param password: User's password
        :return: UserResponse object with the logged-in user's details
        """
        return authenticate_user(email, password, self.db)


    def get_user_by_refresh_token(self, refresh_token: str):
        """
        Get user from refresh token.
        :param refresh_token: JWT refresh token
        :return: UserResponse object with the user's details
        """
        user = get_user_from_refresh_token(refresh_token, self.db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.is_admin
        )

