from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.session import init_db
from app.utils.middlewares.JWTMiddleware import JWTMiddleware
from app.api.v1.endpoint import BookRoutes, UserRoute, AuthRoute, ReviewRoute

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize db
    init_db()
    yield


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add JWT middleware
app.add_middleware(
    JWTMiddleware,
    excluded_paths=[
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/books",
        "/api/v1/reviews/{book_id}",
        "/docs",
        "/redoc",
        "/openapi.json"
    ],
    protected_paths=["/api"]
)

# Include routers
app.include_router(BookRoutes.router, prefix="/api/v1", tags=["Books"])
app.include_router(UserRoute.router, prefix="/api/v1", tags=["Users"])
app.include_router(AuthRoute.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(ReviewRoute.router, prefix="/api/v1", tags=["Reviews"])

@app.get("/")
def root():
    return {"message": "Authentication API is running 🚀"}