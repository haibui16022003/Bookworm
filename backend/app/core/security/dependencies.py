from typing import Optional
from jwt import decode, InvalidTokenError, ExpiredSignatureError
from fastapi import Request, HTTPException, status, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security.password import verify_password
# from app.core.security.app_token import create_access_token, create_refresh_token
from app.db.session import get_session
from app.models import UserModel
from app.schema.UserSchema import UserResponse


class AccessTokenData(BaseModel):
    """
    Token data schema.
    """
    sub: str
    is_admin: bool = False
    token_type: str = "access"


def _strip_bearer(token: str) -> str:
    """
    Helper function to strip the 'Bearer ' prefix from the token.
    """
    token_str = str(token) if token is not None else ""
    return token_str.replace("Bearer ", "") if token_str.startswith("Bearer ") else token_str


def get_token(request: Request, is_refresh_token: bool = False) -> str:
    """
    Get the token from the request.

    :param request: The request object.
    :param is_refresh_token: Whether to fetch the refresh token instead.
    :return: The extracted token string.
    :raises HTTPException: If the token is missing.
    """
    if is_refresh_token:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing refresh token"
            )
        return refresh_token

    # Get token from Authorization header for access tokens
    auth_header = request.headers.get("Authorization")
    if auth_header:
        return _strip_bearer(auth_header)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing access token"
    )


def get_user(user_email: str, db: Session) -> Optional[UserModel]:
    """
    Get the user from the database by email.
    """
    user = db.query(UserModel).filter(UserModel.email == user_email).first()
    return user if user else None


def authenticate_user(email: str, password: str, db: Session) -> Optional[UserResponse]:
    """
    Authenticate the user using email and password.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_admin=user.admin
    )


def get_current_user_from_token(token: str, db: Session) -> UserResponse:
    """
    Get current user from access token.

    :param token: JWT access token
    :param db: Database session
    :return: User data if token is valid
    :raises HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("token_type")

        if email is None:
            raise credentials_exception

        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = get_user(email, db)
        if user is None:
            raise credentials_exception

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.admin
        )
    except (InvalidTokenError, ExpiredSignatureError):
        raise credentials_exception


def get_user_from_refresh_token(refresh_token: str, db: Session) -> UserResponse:
    """
    Validate refresh token and return user.

    :param refresh_token: JWT refresh token
    :param db: Database session
    :return: User data if token is valid
    :raises HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")

        if email is None:
            raise credentials_exception

        user = get_user(email, db)
        if user is None:
            raise credentials_exception

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            is_admin=user.admin
        )
    except (InvalidTokenError, ExpiredSignatureError):
        raise credentials_exception


async def get_current_user(request: Request, db: Session = Depends(get_session)) -> Optional[UserModel]:
    """
    Get the current user from the access token.

    :param request: The request object.
    :param db: The database session.
    :return: The current user model.
    :raises HTTPException: If the user cannot be authenticated.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = get_token(request)
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        token_type = payload.get("token_type")

        if email is None:
            raise credentials_exception

        if token_type != "access":
            raise credentials_exception

        user = get_user(email, db)
        if user is None:
            raise credentials_exception

        return user
    except (InvalidTokenError, ExpiredSignatureError):
        raise credentials_exception