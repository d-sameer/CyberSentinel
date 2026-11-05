
import os
import secrets
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_roles
from app.auth.passwords import hash_password, verify_password
from app.auth.tokens import create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserResponse,
)


router = APIRouter(prefix="/api/auth", tags=["Authentication"])

AdminUser = Annotated[User, Depends(require_roles("Admin"))]


def find_duplicate_user(db: Session, username: str, email: str) -> bool:
    return (
        db.query(User.id)
        .filter(
            (func.lower(User.username) == username.casefold())
            | (func.lower(User.email) == email.casefold())
        )
        .first()
        is not None
    )


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
):
    normalized_username = credentials.username.strip().casefold()

    user = (
        db.query(User)
        .filter(func.lower(User.username) == normalized_username)
        .first()
    )

    if user is None:
        user = (
            db.query(User)
            .filter(func.lower(User.email) == normalized_username)
            .first()
        )

    if (
        user is None
        or not user.is_active
        or not verify_password(credentials.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=create_access_token(user_id=user.id, role=user.role)
    )


@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
):
    return current_user


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _: AdminUser,
):
    return db.query(User).order_by(User.id.asc()).all()


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
    _: AdminUser,
):
    username = payload.username.strip()
    email = str(payload.email).strip().lower()

    if find_duplicate_user(db, username, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered.",
        )

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered.",
        )

    return user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role: Literal["Admin", "Analyst", "Viewer"],
    db: Annotated[Session, Depends(get_db)],
    _: AdminUser,
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.role = role
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Annotated[Session, Depends(get_db)],
    current_admin: AdminUser,
):
    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.id == current_admin.id and not is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


@router.post(
    "/bootstrap-admin",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def bootstrap_admin(
    payload: UserCreate,
    db: Annotated[Session, Depends(get_db)],
    bootstrap_key: Annotated[str | None, Header(alias="X-Bootstrap-Key")] = None,
):
    configured_key = os.getenv("CYBERSENTINEL_BOOTSTRAP_KEY")

    if not configured_key or not bootstrap_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found.",
        )

    if not secrets.compare_digest(bootstrap_key, configured_key):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not found.",
        )

    if db.query(User.id).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Initial administrator setup has already been completed.",
        )

    username = payload.username.strip()
    email = str(payload.email).strip().lower()

    if find_duplicate_user(db, username, email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered.",
        )

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(payload.password),
        role="Admin",
        is_active=True,
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with those details already exists.",
        )

    return user
