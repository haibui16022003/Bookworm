from pydantic import BaseModel, Field

class DiscountSchema(BaseModel):
    """Discount Base Schema"""
    book_id: int = Field(..., gt=0)
    discount_start_date: str
    discount_end_date: str
    discount_price: float = Field(..., gt=0)


class DiscountResponse(DiscountSchema):
    """Discount Response Schema"""
    id: int


class DiscountCreate(DiscountSchema):
    """Discount Create Schema"""
    pass


class DiscountUpdate(DiscountSchema):
    """Discount Update Schema"""
    pass
