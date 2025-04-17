from sqlmodel import Session, create_engine, SQLModel
from typing import Generator, Any
from decimal import Decimal

from app.core.config import settings

# Create the database engine
engine = create_engine(
    settings.db_url(),
    echo=True,
    pool_pre_ping=True,
)

def get_session() -> Generator[Session, Any, Any]:
    """
    Create a new session.
    :return: Session
    """
    with Session(engine) as session:
        yield session


def create_fake_data():
    """
    Create fake data for testing the API with enhanced randomization.
    """
    import random
    import string
    from decimal import Decimal
    from datetime import date, timedelta
    from app.models import (
        CategoryModel,
        BookModel,
        AuthorModel,
        DiscountModel
    )

    with Session(engine) as session:
        print("Creating fake categories...")
        # Create categories with more variety
        category_types = [
            "Fiction", "Non-Fiction", "Science Fiction", "Mystery", "Romance",
            "Fantasy", "Biography", "History", "Self-Help", "Business",
            "Technology", "Horror", "Poetry", "Adventure", "Thriller",
            "Cooking", "Art", "Philosophy", "Psychology", "Science"
        ]

        # Randomly select between 10-15 categories
        selected_categories = random.sample(category_types, random.randint(10, 15))

        categories = [
            CategoryModel(
                category_name=name,
                category_description=f"Books in the {name} category" if random.random() < 0.5 else
                f"Explore our collection of {name} books" if random.random() < 0.5 else
                f"Discover the world of {name}"
            )
            for name in selected_categories
        ]

        session.add_all(categories)
        session.commit()

        print("Creating fake authors...")
        # Create authors with more variety
        first_names = ["Jane", "George", "Agatha", "Stephen", "Michelle", "Yuval", "Dale", "Robert",
                       "Malcolm", "Toni", "Ernest", "Virginia", "Leo", "Haruki", "Gabriel", "Margaret",
                       "Friedrich", "Simone", "Albert", "Emily"]

        last_names = ["Austin", "Orwell", "Christie", "King", "Obama", "Harari", "Carnegie", "Kiyosaki",
                      "Gladwell", "Morrison", "Hemingway", "Woolf", "Tolstoy", "Murakami", "Marquez",
                      "Atwood", "Nietzsche", "Beauvoir", "Camus", "Dickinson"]

        genres = ["classic romance", "dystopian fiction", "mystery", "horror", "memoir", "history",
                  "self-help", "finance", "social science", "magical realism", "modernist literature",
                  "existentialist", "feminist literature", "philosophical", "poetry", "adventure",
                  "thriller", "fantasy", "science", "classic literature"]

        # Create 10-15 authors
        author_count = random.randint(10, 15)
        author_combinations = []

        # Ensure unique author names
        for _ in range(author_count):
            while True:
                first = random.choice(first_names)
                last = random.choice(last_names)
                if (first, last) not in author_combinations:
                    author_combinations.append((first, last))
                    break

        authors = [
            AuthorModel(
                author_name=f"{first} {last}",
                author_bio=f"Award-winning author of {random.choice(genres)} books." if random.random() < 0.5 else
                f"Renowned {random.choice(genres)} writer with multiple bestsellers." if random.random() < 0.5 else
                f"Critically acclaimed writer known for contributions to {random.choice(genres)}."
            )
            for first, last in author_combinations
        ]

        session.add_all(authors)
        session.commit()

        print("Creating fake books...")
        # Book title components for generating random titles
        title_beginnings = ["The", "A", "Journey to", "Secrets of", "Beyond", "Tales from", "Return to", "Whispers of",
                            "Dreams of", "Lost in"]
        title_middles = ["Secret", "Hidden", "Lost", "Ancient", "Eternal", "Final", "First", "Broken", "New", "Last"]
        title_endings = ["Kingdom", "Garden", "Mystery", "Promise", "Adventure", "Path", "Truth", "Destiny", "Legacy",
                         "Journey"]

        # Create 20-30 books
        book_count = random.randint(20, 30)
        books = []

        for _ in range(book_count):
            # Generate random title
            if random.random() < 0.3:
                title = f"{random.choice(title_beginnings)} {random.choice(title_endings)}"
            elif random.random() < 0.7:
                title = f"{random.choice(title_beginnings)} {random.choice(title_middles)} {random.choice(title_endings)}"
            else:
                title = f"{random.choice(title_middles)} {random.choice(title_endings)}"

            # Generate random summary
            summary_templates = [
                f"A compelling {random.choice(genres)} story that will keep you engaged from beginning to end.",
                f"An unforgettable journey through {random.choice(genres)} that challenges conventional thinking.",
                f"The definitive work on {random.choice(genres)} for modern readers.",
                f"A groundbreaking exploration of {random.choice(genres)} themes and ideas."
            ]

            # Generate random price between $7.99 and $29.99
            price = round(random.uniform(7.99, 29.99), 2)

            # Generate random cover image filename
            image_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
            cover = f"cover_{image_id}.jpg"

            books.append(
                BookModel(
                    category_id=random.choice([c.id for c in categories]),
                    author_id=random.choice([a.id for a in authors]),
                    book_title=title,
                    book_summary=random.choice(summary_templates),
                    book_price=Decimal(str(price)),
                    book_cover_photo=cover
                )
            )

        session.add_all(books)
        session.commit()

        print("Creating fake discounts...")
        # Apply discounts to a random selection of books (between 5-10 books)
        today = date.today()
        discount_count = random.randint(5, min(10, len(books)))

        # Get random set of book IDs for discounts
        discounted_book_ids = random.sample([book.id for book in books], discount_count)

        discounts = [
            DiscountModel(
                book_id=book_id,
                discount_start_date=today - timedelta(days=random.randint(0, 20)),
                discount_end_date=today + timedelta(days=random.randint(5, 45)),
                discount_price=round(
                    session.query(BookModel).filter(BookModel.id == book_id).first().book_price *
                    Decimal(str(round(random.uniform(0.6, 0.9), 2))),  # Random discount between 10% and 40%
                    2
                )
            )
            for book_id in discounted_book_ids
        ]

        session.add_all(discounts)
        session.commit()

        print(
            f"Fake data created successfully! Generated {len(categories)} categories, {len(authors)} authors, {len(books)} books, and {len(discounts)} discounts.")

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
