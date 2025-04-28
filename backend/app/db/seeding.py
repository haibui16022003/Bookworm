import random
from datetime import datetime, timedelta
from faker import Faker
from sqlmodel import Session, create_engine
from typing import List
from decimal import Decimal

# Import your models
from app.models import (
    AuthorModel,
    BookModel,
    CategoryModel,
    DiscountModel,
    UserModel,
    ReviewModel,
    OrderModel,
    OrderItemModel
)
from app.core.config import settings

# Initialize Faker
fake = Faker()

# Database connection
DATABASE_URL = settings.db_url()  # Change to your actual database URL
engine = create_engine(DATABASE_URL)

# Number of records to generate
NUM_USERS = 500
NUM_AUTHORS = 400
NUM_CATEGORIES = 20
NUM_BOOKS = 3000
NUM_REVIEWS = 5000
NUM_DISCOUNTS = 500
NUM_ORDERS = 1000
MAX_ORDER_ITEMS = 8


def create_categories(session: Session) -> List[CategoryModel]:
    """Create fake categories."""
    categories = []
    category_names = [
        "Fiction", "Non-Fiction", "Science Fiction", "Fantasy",
        "Mystery", "Biography", "History", "Self-Help",
        "Business", "Technology", "Romance", "Horror",
        "Children's", "Young Adult", "Poetry", "Travel",
        "Cookbooks", "Art & Photography", "Comics & Graphic Novels",
        "Religion & Spirituality", "Science", "Mathematics",
        "Psychology", "Philosophy", "Politics", "Memoirs",
        "True Crime", "Humor", "Adventure", "Dystopian"
    ]

    # Ensure we don't try to create more categories than we have names for
    num_to_create = min(NUM_CATEGORIES, len(category_names))

    # Use random sampling to get unique categories
    selected_categories = random.sample(category_names, num_to_create)

    for name in selected_categories:
        category = CategoryModel(
            category_name=name,
            category_desc=fake.paragraph(nb_sentences=2)
        )
        session.add(category)
        categories.append(category)

    session.commit()
    print(f"Created {len(categories)} categories")
    return categories


def create_authors(session: Session) -> List[AuthorModel]:
    """Create fake authors."""
    authors = []

    # Use a set to track unique author names
    author_names = set()

    # Create authors with unique names
    while len(authors) < NUM_AUTHORS:
        author_name = fake.name()

        # Ensure author name is unique
        if author_name not in author_names:
            author_names.add(author_name)

            author = AuthorModel(
                author_name=author_name,
                author_bio=fake.paragraph(nb_sentences=3)
            )
            session.add(author)
            authors.append(author)

    session.commit()
    print(f"Created {len(authors)} authors")
    return authors


def create_books(session: Session, categories: List[CategoryModel], authors: List[AuthorModel]) -> List[BookModel]:
    """Create fake books."""
    books = []

    # Use a set to track unique book titles
    book_titles = set()

    # Batch size for commits to avoid memory issues
    BATCH_SIZE = 100

    # Create books in batches
    for i in range(NUM_BOOKS):
        # Try to generate a unique title
        attempts = 0
        while attempts < 5:  # Limit attempts to avoid infinite loop
            title = fake.catch_phrase()
            if title not in book_titles:
                book_titles.add(title)
                break
            attempts += 1

        # If we couldn't generate a unique title after several attempts, add a random suffix
        if title in book_titles and attempts >= 5:
            title = f"{title} {fake.word()}"
            book_titles.add(title)

        # Generate random image URL using Lorem Picsum
        random_seed = random.randint(1, 100000)  # Increased range for more variety
        cover_photo = f"https://picsum.photos/seed/{random_seed}/200/300"

        book = BookModel(
            category_id=random.choice(categories).id,
            author_id=random.choice(authors).id,
            book_title=title,
            book_summary=fake.text(max_nb_chars=500),
            book_price=round(random.uniform(9.99, 49.99), 2),
            book_cover_photo=cover_photo
        )
        session.add(book)
        books.append(book)

        # Commit in batches to avoid memory issues
        if (i + 1) % BATCH_SIZE == 0 or i == NUM_BOOKS - 1:
            session.commit()
            print(f"Created {len(books)} books so far...")

    print(f"Created total of {len(books)} books")
    return books


def create_users(session: Session) -> List[UserModel]:
    """Create fake users."""
    users = []

    # Use a set to track unique emails
    emails = set()

    # Create one admin user
    admin_user = UserModel(
        first_name="Admin",
        last_name="User",
        email="admin@bookstore.com",
        password="$2b$12$1HhJqsI2JQXmHSNhs1gj3O/9UywYh2Jlp4ZD4duw2GfWNmq5siiQa",  # hashed 'password123'
        admin=True
    )
    session.add(admin_user)
    users.append(admin_user)
    emails.add("admin@bookstore.com")

    # Create regular users
    while len(users) < NUM_USERS:
        email = fake.email()

        # Ensure email is unique
        if email not in emails:
            emails.add(email)

            user = UserModel(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                email=email,
                password="$2b$12$1HhJqsI2JQXmHSNhs1gj3O/9UywYh2Jlp4ZD4duw2GfWNmq5siiQa",  # hashed 'password123'
                admin=False
            )
            session.add(user)
            users.append(user)

    session.commit()
    print(f"Created {len(users)} users")
    return users


def create_reviews(session: Session, books: List[BookModel], users: List[UserModel]) -> List[ReviewModel]:
    """Create fake reviews."""
    reviews = []

    # Batch size for commits
    BATCH_SIZE = 200

    for i in range(NUM_REVIEWS):
        # Generate a review date within the last year
        review_date = datetime.now() - timedelta(days=random.randint(1, 365))

        review = ReviewModel(
            book_id=random.choice(books).id,
            review_title=fake.sentence(nb_words=6)[:-1],  # Remove period
            review_details=fake.paragraph(nb_sentences=random.randint(1, 5)),
            review_date=review_date,
            rating_star=random.randint(1, 5)
        )
        session.add(review)
        reviews.append(review)

        # Commit in batches to avoid memory issues
        if (i + 1) % BATCH_SIZE == 0 or i == NUM_REVIEWS - 1:
            session.commit()
            print(f"Created {len(reviews)} reviews so far...")

    print(f"Created total of {len(reviews)} reviews")
    return reviews


def create_discounts(session: Session, books: List[BookModel]) -> List[DiscountModel]:
    """Create fake discounts."""
    discounts = []

    # Select random books for discount
    discount_books = random.sample(books, min(NUM_DISCOUNTS, len(books)))

    # Batch size for commits
    BATCH_SIZE = 100

    for i, book in enumerate(discount_books):
        # Start date between now and 30 days ago
        start_date = datetime.now().date() - timedelta(days=random.randint(0, 30))
        # End date between tomorrow and 60 days from now
        end_date = datetime.now().date() + timedelta(days=random.randint(1, 60))

        # Discount is between 10% and 50% off
        discount_percentage = random.uniform(0.1, 0.5)
        discount_price = Decimal(str(book.book_price)) * Decimal(str(1 - discount_percentage))
        discount_price = round(discount_price, 2)

        discount = DiscountModel(
            book_id=book.id,
            discount_start_date=start_date,
            discount_end_date=end_date,
            discount_price=discount_price
        )
        session.add(discount)
        discounts.append(discount)

        # Commit in batches
        if (i + 1) % BATCH_SIZE == 0 or i == len(discount_books) - 1:
            session.commit()
            print(f"Created {len(discounts)} discounts so far...")

    print(f"Created total of {len(discounts)} discounts")
    return discounts


def create_orders(session: Session, users: List[UserModel], books: List[BookModel]) -> List[OrderModel]:
    """Create fake orders with order items."""
    orders = []
    order_items_count = 0

    # Batch size for commits
    BATCH_SIZE = 50

    for i in range(NUM_ORDERS):
        # Order date within the last 6 months
        order_date = datetime.now() - timedelta(days=random.randint(1, 180))

        # Create order first (without amount)
        order = OrderModel(
            user_id=random.choice(users).id,
            order_date=order_date,
            order_amount=0  # Will update after adding items
        )
        session.add(order)
        session.flush()  # Get the order ID

        # Add random number of items to the order
        num_items = random.randint(1, MAX_ORDER_ITEMS)
        order_books = random.sample(books, num_items)

        total_amount = 0
        for book in order_books:
            quantity = random.randint(1, 3)
            price = book.book_price

            # Check if there's an active discount for this book
            discounts = session.query(DiscountModel).filter(
                DiscountModel.book_id == book.id,
                DiscountModel.discount_start_date <= order_date.date(),
                DiscountModel.discount_end_date >= order_date.date()
            ).all()

            if discounts:
                # Use the discounted price
                price = discounts[0].discount_price

            # Create order item
            order_item = OrderItemModel(
                order_id=order.id,
                book_id=book.id,
                quantity=quantity,
                price=price
            )
            session.add(order_item)
            order_items_count += 1

            # Update total amount
            total_amount += price * quantity

        # Update order with final amount
        order.order_amount = round(total_amount, 2)
        orders.append(order)

        # Commit in batches
        if (i + 1) % BATCH_SIZE == 0 or i == NUM_ORDERS - 1:
            session.commit()
            print(f"Created {len(orders)} orders with {order_items_count} items so far...")

    print(f"Created total of {len(orders)} orders with {order_items_count} order items")
    return orders


def seed_database():
    """Main function to seed the database."""
    with Session(engine) as session:
        print("Starting database seeding...")
        print(f"Target counts: {NUM_CATEGORIES} categories, {NUM_AUTHORS} authors, {NUM_BOOKS} books")
        print(f"{NUM_USERS} users, {NUM_REVIEWS} reviews, {NUM_DISCOUNTS} discounts, {NUM_ORDERS} orders")

        try:
            # Create data in correct order to respect foreign keys
            categories = create_categories(session)
            authors = create_authors(session)
            books = create_books(session, categories, authors)
            users = create_users(session)
            create_reviews(session, books, users)
            create_discounts(session, books)
            create_orders(session, users, books)

            print("Database seeding completed successfully!")
        except Exception as e:
            session.rollback()
            print(f"Error seeding database: {e}")
            raise


if __name__ == "__main__":
    seed_database()