from sqlmodel import Session, create_engine, SQLModel
from decimal import Decimal
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
    with Session(engine) as session:
        yield session


def create_fake_data():
    """
    Create fake data for testing the API.
    """
    import random
    from datetime import date, timedelta
    from app.models import (
        CategoryModel,
        BookModel,
        AuthorModel,
        DiscountModel
    )
    with Session(engine) as session:
        print("Creating fake categories...")
        # Create categories
        categories = [
            CategoryModel(
                category_name=name,
                category_description=f"Books in the {name} category"
            )
            for name in [
                "Fiction", "Science Fiction", "Mystery", "Romance",
                "Fantasy", "Biography", "History", "Self-Help",
                "Business", "Technology"
            ]
        ]

        session.add_all(categories)
        session.commit()

        print("Creating fake authors...")
        # Create authors
        authors = [
            AuthorModel(
                author_name=name,
                author_bio=f"Award-winning author of {genre} books."
            )
            for name, genre in [
                ("Jane Austin", "classic romance"),
                ("George Orwell", "dystopian fiction"),
                ("Agatha Christie", "mystery"),
                ("J.K. Rowling", "fantasy"),
                ("Stephen King", "horror"),
                ("Michelle Obama", "memoir"),
                ("Yuval Noah Harari", "history"),
                ("Dale Carnegie", "self-help"),
                ("Robert Kiyosaki", "finance"),
                ("Malcolm Gladwell", "social science")
            ]
        ]

        session.add_all(authors)
        session.commit()

        print("Creating fake books...")
        # Create books
        books = [
            BookModel(
                category_id=random.randint(1, len(categories)),
                author_id=random.randint(1, len(authors)),
                book_title=title,
                book_summary=f"A compelling {genre} story that will keep you engaged from beginning to end.",
                book_price=price,
                book_cover_photo=f"cover_{i + 1}.jpg"
            )
            for i, (title, genre, price) in enumerate([
                ("Pride and Prejudice", "romance", 15.99),
                ("1984", "dystopian", 12.50),
                ("Murder on the Orient Express", "mystery", 14.75),
                ("Harry Potter and the Philosopher's Stone", "fantasy", 19.99),
                ("The Shining", "horror", 16.25),
                ("Becoming", "autobiography", 24.99),
                ("Sapiens: A Brief History of Humankind", "history", 22.50),
                ("How to Win Friends and Influence People", "self-help", 12.99),
                ("Rich Dad Poor Dad", "finance", 15.25),
                ("Outliers: The Story of Success", "social science", 18.75)
            ])
        ]

        session.add_all(books)
        session.commit()

        print("Creating fake discounts...")
        # Create discounts (apply to some books)
        today = date.today()
        discounts = [
            DiscountModel(
                book_id=book_id,
                discount_start_date=today - timedelta(days=5),
                discount_end_date=today + timedelta(days=10 + i),
                discount_price=round(books[book_id-1].book_price * Decimal('0.8'), 2)  # 20% discount
            )
            for i, book_id in enumerate([2, 4, 6, 8])  # Apply discounts to books with IDs 2, 4, 6, 8
        ]

        session.add_all(discounts)
        session.commit()

        print("Fake data created successfully!")


def init_db() -> None:
    """
    Initialize the database.
    :return: None
    """
    from app.models import (
        UserModel,
        AuthorModel,
        CategoryModel,
        BookModel,
        DiscountModel,
        OrderModel,
        OrderItemModel,
        ReviewModel
    )


    SQLModel.metadata.create_all(engine)

    # Create fake data
    # create_fake_data()
