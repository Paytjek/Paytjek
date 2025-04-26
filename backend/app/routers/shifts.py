from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select as sql_select

from app.db import get_db                      # ← rettet
from app.models import Shift                   # ← rettet
from app.schemas import ShiftCreate, ShiftRead, ICSImport
from app.utils.ics_import import fetch_ics, ical_to_shifts
# ... resten uændret

router = APIRouter(prefix="/api/v1/shifts", tags=["shifts"])

@router.post("", response_model=ShiftRead, status_code=status.HTTP_201_CREATED)
async def add_shift(payload: ShiftCreate, db: AsyncSession = Depends(get_db)):
    new = Shift(**payload.dict())
    db.add(new)
    await db.commit()
    await db.refresh(new)
    return new

@router.get("/{user_id}", response_model=list[ShiftRead])
async def list_shifts(user_id: int, db: AsyncSession = Depends(get_db)):
    # Eksplicit specificere kolonner
    stmt = sql_select(
        Shift.id,
        Shift.user_id,
        Shift.date,
        Shift.start_time,
        Shift.end_time,
        Shift.hours,
        Shift.title,
        Shift.created_at
    ).where(Shift.user_id == user_id)
    res = await db.execute(stmt)
    return res.all()

@router.post("/import", status_code=201)
async def import_ics(payload: ICSImport, user_id: int, db: AsyncSession = Depends(get_db)):
    ics_text = await fetch_ics(payload.ics_url)
    shift_dicts = ical_to_shifts(ics_text, user_id)
    shifts = [Shift(**d) for d in shift_dicts]
    db.add_all(shifts)
    await db.commit()
    return {"imported": len(shifts)}
