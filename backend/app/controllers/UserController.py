from typing import Optional, Dict, List
from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select

from app.schema.UserSchema import *
from app.models import UserModel
from app.core.security import hash_password, verify_password
from app.db.session import get_session


class UserController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db


    @staticmethod
    def _get_user_query(email: str = None, user_id: int = None):
        """
        Helper function to build the base query for getting a user.
        :param email: Email of the user
        :param user_id: ID of the user
        :return: SQLModel object representing the query
        """
        if email:
            return select(UserModel).where(UserModel.email == email)
        elif user_id:
            return select(UserModel).where(UserModel.id == user_id)
        return select(UserModel)


    def create_user(self, user: UserCreate) -> Optional[UserResponse]:
        """
        Create a new user in the database.
        :param user: UserCreate object containing user details
        :return: UserResponse object with created user details
        :raises HTTPException if user already exists
        """
        hashed_password = hash_password(user.password)
        new_user = UserModel(
            email=user.email,
            password=hashed_password,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.is_admin
        )
        query = self._get_user_query(email=user.email)
        existing_user = self.db.exec(query).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return UserResponse.model_validate(new_user)


    def update_user(self, user_id: int, old_password: str, data: UserUpdate) -> Optional[UserResponse]:
        """
        Update user information in the database.
        :param user_id: ID of the user to be updated
        :param old_password: Old password for verification
        :param data: New user data
        :return: UserResponse object with updated user details
        :raises HTTPException if user not found or password is incorrect
        """
        query = self._get_user_query(user_id=user_id)
        user = self.db.exec(query).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if data.email != user.email:
            email_query = self._get_user_query(email=data.email)
            existing_user = self.db.exec(email_query).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        if not verify_password(old_password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
        user.email = data.email
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.password = hash_password(data.password)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)


    def update_password(self, user_id: int, old_password: str, new_password: str) -> Optional[UserResponse]:
        """
        Update the password of a user.
        :param user_id: ID of the user
        :param old_password: Old password for verification
        :param new_password: New password
        :return: UserResponse object with updated user details
        :raises HTTPException if user not found or password is incorrect
        """
        query = self._get_user_query(user_id=user_id)
        user = self.db.exec(query).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if not verify_password(old_password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password"
            )
        user.password = hash_password(new_password)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)


    def delete_user(self, user_id: int) -> Optional[Dict]:
        """
        Delete a user from the database.
        :param user_id: ID of the user to be deleted
        :return: Success message
        :raises HTTPException if user not found
        """
        query = self._get_user_query(user_id=user_id)
        user = self.db.exec(query).first()
        if user:
            self.db.delete(user)
            self.db.commit()
            return {"message": "User deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

    def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        user = self._get_user_query(user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return UserResponse.model_validate(user)


    def get_all_users(self, offset: int = 0, limit: int = 100) -> List[UserResponse]:
        """
        Get all users in the database.
        :param offset: Offset for pagination
        :param limit: Limit for pagination
        :return: List of UserResponse objects
        """
        query = self._get_user_query().offset(offset).limit(limit)
        users = self.db.exec(query).all()
        return [UserResponse.model_validate(user) for user in users]