from functools import wraps
from typing import Callable, Optional, List
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import get_current_user
from app.db.session import get_session


class JWTMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app,
        excluded_paths: Optional[List[str]] = None,
        protected_paths: Optional[List[str]] = None
    ):
        """
        Initialize JWT middleware with custom configuration.
        :param app: The FastAPI application
        :param excluded_paths: List of paths that should be excluded from authentication
        :param protected_paths: List of paths that should be protected
        """
        super().__init__(app)
        self.excluded_paths = excluded_paths or [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/books",
            "/docs",
            "/redoc",
            "/openapi.json"
        ]
        self.protected_paths = protected_paths or ["/api"]

    async def dispatch(self, request: Request, call_next):
        """
        Middleware to handle JWT authentication.
        :param request: The incoming request.
        :param call_next: The next middleware or route handler.
        :return: The response from the next middleware or route handler.
        """
        path = request.url.path

        is_excluded = any(path.startswith(excluded) for excluded in self.excluded_paths)
        is_protected = any(path.startswith(protected) for protected in self.protected_paths)

        # Initialize response in request state for potential token refresh
        response = Response("Unauthorized", status_code=401)
        request.state.response = response

        try:
            # Get database session
            db = next(get_session())
            # print("Check DB success")
            # Try to authenticate user
            user = await get_current_user(request, db)
            # print("Check user success")
            # Store user in request state
            request.state.user = user
        except HTTPException as e:
            # If authentication fails, check if path is protected
            if self._check_protected_path(request.url.path):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "Access forbidden"},
                )

        # Continue with the request
        response = await call_next(request)

        # Propagate any set-cookie headers from state response
        if hasattr(request.state, "response") and request.state.response.headers.get("set-cookie"):
            for header in request.state.response.headers.getlist("set-cookie"):
                response.headers.append("set-cookie", header)

        return response

    def _check_protected_path(self, request_path: str) -> bool:
        """
        Check if the request path is protected.
        :param request_path: The path of the request.
        :return: True if the path is protected, False otherwise.
        """
        # First check excluded paths
        for excluded in self.excluded_paths:
            if request_path.startswith(excluded):
                return False

        # Then check protected paths
        for protected in self.protected_paths:
            if request_path.startswith(protected):
                return True

        # Default to not protected
        return False


def admin_access(admin_required: bool = False):
    """
    Dependency for endpoints that require authentication.
    :param admin_required: If True, the user must be an admin.
    :return: Decorator function.
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request = None

            # Find the request object in args or kwargs
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                for key, value in kwargs.items():
                    if isinstance(value, Request):
                        request = value
                        kwargs[key] = request
                        break

            if not request or not hasattr(request.state, "user"):
                # print("now ít here")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                    headers={"WWW-Authenticate": "Bearer"}
                )

            user = request.state.user

            if admin_required and not user.admin:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin privileges required"
                )

            return await func(*args, **kwargs)

        return wrapper

    return decorator

