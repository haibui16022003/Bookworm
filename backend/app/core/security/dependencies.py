from typing import Optional
from jwt import decode, InvalidTokenError
from fastapi import Request, Cookie, HTTPException, status, Depends
from pydantic import BaseModel

from app.core.config import settings
from app.core.security.password import verify_password
from app.db.session import get_session
from app.models import UserModel

class TokenData(BaseModel):
    """
    Token data schema.
    """
    sub: str
    is_admin: bool = False



def get_token(request: Request, access_token: Optional[str] = Cookie(None), is_refresh_token = False) -> str:
    """
    Get the token from the request.
    :param request: The request object.
    :param access_token: The access token from the cookie.
    :param is_refresh_token: Flag to check if the token is a refresh token.
    :return: The access token.
    """
    if is_refresh_token:
        refresh_token = request.cookies.get("refresh_token")
        if refresh_token:
            return refresh_token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )

    if access_token:
        return access_token.replace("Bearer ", "") if access_token.startswith("Bearer ") else access_token

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.replace("Bearer ", "")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing access token"
    )

def get_user(user_email: str, db: Depends(get_session)) -> Optional[UserModel]:
    """
    Get the user from the database.
    :param user_email: The email of the user.
    :param db: The database session.
    :return: The user object.
    """
    user = db.query(UserModel).filter(UserModel.email == user_email).first()
    return UserModel.model_validate(user) if user else None


def authenticate_user(email: str, password: str, db: Depends(get_session)) -> Optional[UserModel]:
    """
    Authenticate the user.
    :param email: The email of the user.
    :param password: The password of the user.
    :param db: The database session.
    :return: The user object.
    """
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return UserModel.model_validate(user)
        

def get_current_user(token: Depends(get_token), db: Depends(get_session)) -> Optional[UserModel]:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenData(**payload)
    except (InvalidTokenError, TypeError, ValueError):
        raise credentials_exception

    user = get_user(user_email=token_data.sub, db=db)
    if not user:
        raise credentials_exception

    return UserModel.model_validate(user)
