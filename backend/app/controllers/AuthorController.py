from fastapi import Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.db.session import get_session
from app.models import AuthorModel
from app.schema.AuthorSchema import AuthorResponse, AuthorCreate, AuthorUpdate


class AuthorController:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def _check_existing_author(self, author_name: str) -> bool:
        """
        Check if an author with the given name already exists in the database.
        :param author_name: Name of the author to check
        :return: True if author exists, False otherwise
        """
        existing_author = self.db.exec(
            select(AuthorModel).where(AuthorModel.author_name == author_name)
        ).first()
        return existing_author is not None


    def create_author(self, author_data: AuthorCreate) -> AuthorResponse:
        """
        Create a new author in the database.
        :param author_data: AuthorCreate object containing author details
        :return: AuthorResponse object with the created author details
        """
        if self._check_existing_author(author_data.author_name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Author already exists")

        new_author = AuthorModel(**author_data.model_dump())
        self.db.add(new_author)
        self.db.commit()
        self.db.refresh(new_author)
        return AuthorResponse(
            id=new_author.id,
            author_name=new_author.author_name,
            author_bio=new_author.author_bio
        )


    def get_author(self) -> List[AuthorResponse]:
        """
        Get all authors.
        :return: List of AuthorResponse objects
        """
        authors = self.db.exec(select(AuthorModel)).all()
        return [
            AuthorResponse(
                id=author.id,
                author_name=author.author_name,
                author_bio=author.author_bio,
            )
            for author in authors
        ]


    def update_author(self, author_id: int, author_data: AuthorUpdate) -> AuthorResponse:
        """
        Update an existing author in the database.
        :param author_id: Author ID to update
        :param author_data: AuthorUpdate object containing updated author details
        :return: AuthorResponse object with the updated author details
        """
        author = self.db.get(AuthorModel, author_id)
        if not author:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")
        if author_data.author_name != author.author_name and self._check_existing_author(author_data.author_name):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Author already exists")

        author.author_name = author_data.author_name
        author.author_bio = author_data.author_bio
        self.db.commit()
        self.db.refresh(author)
        return AuthorResponse(
            id=author.id,
            author_name=author.author_name,
            author_bio=author.author_bio
        )


    def delete_author(self, author_id: int) -> None:
        """
        Delete an author from the database.
        :param author_id: Author ID to delete
        :return:
        """
        author = self.db.get(AuthorModel, author_id)
        if not author:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Author not found")
        self.db.delete(author)
        self.db.commit()