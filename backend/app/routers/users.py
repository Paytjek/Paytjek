from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select as sql_select

from app.db import get_db
from app.models import User
from app.schemas import UserCreate, UserRead

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Opret en ny bruger med kun de felter, vi har defineret i UserCreate (username, full_name, phone, ics_url, workplace).
    """
    new = User(
        username=payload.username,
        full_name=payload.full_name,
        phone=payload.phone,
        ics_url=payload.ics_url,
        workplace=payload.workplace
    )
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db)):
    """Hent alle brugere fra databasen"""
    stmt = sql_select(
        User.id,
        User.username,
        User.full_name,
        User.phone,
        User.ics_url,
        User.workplace,
        User.is_active,
        User.created_at
    )
    res = await db.execute(stmt)
    return res.all()

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """Hent en bruger med ID fra databasen"""
    stmt = sql_select(
        User.id,
        User.username,
        User.full_name,
        User.phone,
        User.ics_url,
        User.workplace,
        User.is_active,
        User.created_at
    ).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
