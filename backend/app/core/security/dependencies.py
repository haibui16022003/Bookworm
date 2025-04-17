from typing import Optional
from jwt import decode, InvalidTokenError, ExpiredSignatureError
from fastapi import Request, HTTPException, status, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.security.password import verify_password
from app.core.security.app_token import create_access_token
from app.db.session import get_session
from app.models import UserModel


class TokenData(BaseModel):
    """
    Token data schema.
    """
    sub: str
    is_admin: bool = False


def _strip_bearer(token: str) -> str:
    """
    Helper function to strip the 'Bearer ' prefix from the token.
    """
    token_str = str(token) if token is not None else ""
    return token_str.replace("Bearer ", "") if token_str.startswith("Bearer ") else token_str


def get_token(request: Request, access_token: Optional[str] = None, is_refresh_token: bool = False) -> str:
    """
    Get the token from the request.

    :param request: The request object.
    :param access_token: The access token from the cookie (optional).
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

    if access_token:
        return _strip_bearer(access_token)

    auth_header = request.headers.get("Authorization")
    if auth_header:
        return _strip_bearer(auth_header)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing access token"
    )


def get_user(user_email: str, db) -> Optional[UserModel]:
    """
    Get the user from the database by email.
    """
    user = db.query(UserModel).filter(UserModel.email == user_email).first()
    return UserModel.model_validate(user) if user else None


def authenticate_user(email: str, password: str, db) -> Optional[UserModel]:
    """
    Authenticate the user using email and password.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return UserModel.model_validate(user)


async def get_current_user(request: Request, db=Depends(get_session)) -> Optional[UserModel]:
    """
    Get the current user from the access token, and refresh it if expired.

    :param request: The request object.
    :param db: The database session.
    :return: The current user model.
    :raises HTTPException: If the user cannot be authenticated.
    """
    response = getattr(request.state, "response", None)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = get_token(request)
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception

        user = get_user(email, db)
        if user is None:
            raise credentials_exception

        return user

    except ExpiredSignatureError:
        try:
            refresh_token = get_token(request, is_refresh_token=True)
            refresh_payload = decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_data = TokenData(**refresh_payload)

            user = get_user(token_data.sub, db)
            if user is None:
                raise credentials_exception

            new_access_token = create_access_token(
                data={"sub": user.email, "is_admin": user.admin},
            )

            if response:
                response.set_cookie(
                    key="access_token",
                    value=new_access_token,
                    httponly=True,
                    expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # expires is in seconds
                    samesite="lax",
                    secure=False
                )

            request.state.user = user
            return user

        except (InvalidTokenError, ExpiredSignatureError):
            raise credentials_exception

    except InvalidTokenError:
        raise credentials_exception
