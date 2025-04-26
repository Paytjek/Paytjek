from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

# ---------- User ----------
class UserBase(BaseModel):
    username: str
    full_name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    ics_url: Optional[str] = None
    workplace: Optional[str] = None

class UserRead(UserBase):
    id: int
    ics_url: Optional[str] = None
    workplace: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

# ---------- Profile (for Frontend compatibility) ----------
class ProfileRead(BaseModel):
    user_id: str  # Username from database
    name: str     # Full name from database
    workplace: Optional[str] = None
    language: Optional[str] = "da"
    ics_url: Optional[str] = None

    class Config:
        from_attributes = True

# ---------- Shift ----------
class ShiftCreate(BaseModel):
    user_id: int
    date: date
    start_time: datetime
    end_time: datetime
    hours: float
    title: str = "Vagt"

class ShiftRead(ShiftCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# ---------- Payslip ----------
class PayslipCreate(BaseModel):
    user_id: int
    date: date
    work_hours: Optional[float] = None
    gross_salary: Optional[float] = None
    deductions_total: Optional[float] = None
    net_salary: Optional[float] = None
    file_path: Optional[str] = None

class PayslipRead(PayslipCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

# ---------- ICS Import Payload ----------
class ICSImport(BaseModel):
    ics_url: str
