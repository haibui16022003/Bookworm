from datetime import datetime
from pydantic import BaseModel, Field

class ReviewSchema(BaseModel):
    """
    Review Base Schema
    """
    book_id: int = Field(..., gt=0)
    review_title: str = Field(..., min_length=1, max_length=100)
    review_details: str
    rating_star: int = Field(..., ge=1, le=5)


class ReviewResponse(ReviewSchema):
    """
    Review Response Schema
    """
    id: int
    review_date: datetime


class ReviewCreate(ReviewSchema):
    """
    Review Create Schema
    """
    pass