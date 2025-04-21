from fastapi import APIRouter, Depends
from typing import List

from app.controllers.AuthorController import AuthorController
from app.schema.AuthorSchema import AuthorResponse, AuthorCreate, AuthorUpdate

router = APIRouter(prefix="/authors", tags=["Authors"])

@router.post("/", response_model=AuthorResponse)
async def create_author(
    author_data: AuthorCreate,
    author_controller: AuthorController = Depends(AuthorController),
):
    """
    Create a new author.
    :param author_data: AuthorCreate object containing author details
    :param author_controller: AuthorController dependency
    :return: AuthorResponse object with the created author details
    """
    return author_controller.create_author(author_data)


@router.get("/", response_model=List[AuthorResponse])
async def get_authors(
    author_controller: AuthorController = Depends(AuthorController),
):
    """
    Get all authors.
    :param author_controller: AuthorController dependency
    :return: List of AuthorResponse objects
    """
    return author_controller.get_author()


@router.put("/{author_id}", response_model=AuthorResponse)
async def update_author(
    author_id: int,
    author_data: AuthorUpdate,
    author_controller: AuthorController = Depends(AuthorController),
):
    """
    Update an existing author.
    :param author_id: ID of the author to update
    :param author_data: AuthorUpdate object containing updated author details
    :param author_controller: AuthorController dependency
    :return: AuthorResponse object with the updated author details
    """
    return author_controller.update_author(author_id, author_data)


@router.delete("/{author_id}", response_model=AuthorResponse)
async def delete_author(
    author_id: int,
    author_controller: AuthorController = Depends(AuthorController),
):
    """
    Delete an existing author.
    :param author_id: ID of the author to delete
    :param author_controller: AuthorController dependency
    :return: AuthorResponse object with the deleted author details
    """
    return author_controller.delete_author(author_id)