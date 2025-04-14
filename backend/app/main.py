from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

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


@app.get("/")
def root():
    return {"message": "Authentication API is running 🚀"}