from pydantic import BaseModel, Field

class AuthorSchema(BaseModel):
    author_name: str = Field(..., title="Author Name", description="Name of the author")
    author_bio: str = Field(..., title="Author Bio", description="Biography of the author")


class AuthorResponse(BaseModel):
    id: int = Field(..., title="Author ID", description="Unique identifier for the author")
    author_name: str = Field(..., title="Author Name", description="Name of the author")
    author_bio: str = Field(..., title="Author Bio", description="Biography of the author")

class AuthorCreate(AuthorSchema):
    pass


class AuthorUpdate(AuthorSchema):
    pass