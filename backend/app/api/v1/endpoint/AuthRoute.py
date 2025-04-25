from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, Dict
from datetime import datetime, timezone, timedelta

from app.controllers.AuthController import AuthController
from app.core.config import settings
from app.core.security.app_token import create_access_token, create_refresh_token, decode_token
from app.schema.UserSchema import UserRegister, UserResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    auth_controller: AuthController = Depends()
) -> Optional[UserResponse]:
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
        - Refresh token is set in the HTTP-only cookie
        - Access token is returned in the response JSON for client-side storage
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

    access_token = create_access_token(data={"sub": user.email, "is_admin": user.is_admin})
    refresh_token = create_refresh_token(data={"sub": user.email})

    # Set refresh token in HTTP-only cookie
    cookies_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        expires=cookies_expires.timestamp(),
        samesite="lax",
        secure=True
    )

    # Return access token in response body - client will store in localStorage
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/refresh")
async def refresh_token(
    request: Request,
    auth_controller: AuthController = Depends()
) -> Optional[Dict]:
    """
    Refresh access token using refresh token cookie
    :param request: Request object to get cookies
    :param auth_controller: AuthController dependency
    :return: Dictionary containing new access token
    """
    # Validate refresh token and get user
    refresh_tk = request.cookies.get("refresh_token")
    if not refresh_tk:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = auth_controller.get_user_by_refresh_token(refresh_tk)
    # Generate new tokens
    access_token = create_access_token(data={"sub": user.email, "is_admin": user.is_admin})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(
    response: Response
) -> Dict:
    """
    Logout and clear the refresh token cookie
    :param response: Response object to set cookies
    :return: Success message
    """
    response.delete_cookie(key="refresh_token")
    return {"message": "Logged out successfully"}