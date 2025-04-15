from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.session import init_db
from app.api.v1.endpoint import BookRoutes

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
# app.add_middleware(
#     JWTMiddleware,
#     secret_key=settings.SECRET_KEY,
#     algorithm=settings.ALGORITHM,
#     exclude_paths=PUBLIC_PATHS
# )


# Include routers
app.include_router(BookRoutes.router, prefix="/api/v1", tags=["Books"])

@app.get("/")
def root():
    return {"message": "Authentication API is running 🚀"}