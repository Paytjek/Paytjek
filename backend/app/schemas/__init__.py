from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import List

# ---------- User ----------
class UserCreate(BaseModel):
    navn: str = Field(..., min_length=1)

class UserRead(UserCreate):
    user_id: int

    class Config:
        orm_mode = True

# ---------- Shift ----------
class ShiftCreate(BaseModel):
    user_id: int
    dato: date
    start_tid: datetime
    slut_tid: datetime
    timer: float

class ShiftRead(ShiftCreate):
    shift_id: int

    class Config:
        orm_mode = True

# ---------- Import‑payload ----------
class ICSImport(BaseModel):
    ics_url: str
