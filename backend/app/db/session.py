from sqlmodel import Session, create_engine, SQLModel

from app.core.config import settings

# Create the database engine
engine = create_engine(
    settings.db_url(),
    echo=True,
    pool_pre_ping=True,
)

def get_session() -> Session:
    """
    Create a new session.
    :return: Session
    """
    return Session(engine)


def init_db() -> None:
    """
    Initialize the database.
    :return: None
    """
    from app.models import (
        UserModel,
        BookModel,
        AuthorModel,
        CategoryModel,
        DiscountModel,
        OrderModel,
        OrderItemModel,
        ReviewModel
    )

    SQLModel.metadata.create_all(engine)

    # Create fake data

