from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.db.session import init_db
from app.utils.middlewares.JWTMiddleware import JWTMiddleware
from app.api.v1.endpoint import BookRoute, UserRoute, AuthRoute, ReviewRoute, AuthorRoute, CategoryRoute, OrderRoute

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
app.add_middleware(JWTMiddleware)

# Include routers
app.include_router(BookRoute.router, prefix="/api/v1", tags=["Books"])
app.include_router(UserRoute.router, prefix="/api/v1", tags=["Users"])
app.include_router(AuthRoute.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(ReviewRoute.router, prefix="/api/v1", tags=["Reviews"])
app.include_router(AuthorRoute.router, prefix="/api/v1", tags=["Authors"])
app.include_router(CategoryRoute.router, prefix="/api/v1", tags=["Categories"])
app.include_router(OrderRoute.router, prefix="/api/v1", tags=["Orders"])

@app.get("/")
def root():
    return {"message": "Authentication API is running 🚀"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)