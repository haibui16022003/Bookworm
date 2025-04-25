from datetime import datetime, timedelta, timezone
import jwt
from typing import Optional

from app.core.config import settings

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create JWT access token with expiration time.
    :param data: Data to encode in the token.
    :param expires_delta: Expiration time delta.
    :return: Encoded JWT token.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    })

    try:
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    except jwt.PyJWTError as e:
        raise ValueError(f"Token generation failed: {e}")
    return encoded_jwt


def create_refresh_token(
    data: dict,
):
    """
    Create refresh token with longer expiration time.
    :param data: Data to encode in the token.
    :return: Encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc)
    })

    try:
        encoded_refresh_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    except jwt.PyJWTError as e:
        raise ValueError(f"Token generation failed: {e}")
    return encoded_refresh_jwt


def decode_token(token: str):
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    return payload
