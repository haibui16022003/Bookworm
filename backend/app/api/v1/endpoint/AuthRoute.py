from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, Dict
from datetime import datetime, timezone, timedelta

from app.controllers.AuthController import AuthController
from app.core.config import settings
from app.core.security import get_token, create_access_token, create_refresh_token
from app.schema.UserSchema import UserRegister, UserResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    auth_controller: AuthController = Depends()
)-> Optional[UserResponse]:
    """
    Register a new user
    :param user_data: User registration data
    :param auth_controller: AuthController dependency
    :return: UserResponse object with the registered user's details
    """
    return auth_controller.register_user(user_data)


@router.post("/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_controller: AuthController = Depends()
) -> Optional[Dict]:
    """
    Login to get access and refresh tokens
        - Refresh toke is set in the cookie
        - Access token is returned in the response
    :param response: Response object to set cookies
    :param form_data: Form data containing email and password
    :param auth_controller: AuthController dependency
    :return: Dictionary containing access token
    """
    user = auth_controller.login_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.email, "is_admin": user.admin})
    refresh_token = create_refresh_token(data={"sub": user.email})

    cookies_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        expires=cookies_expires,
        samesite="lax",
        secure=False
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

