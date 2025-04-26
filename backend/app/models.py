from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    ics_url = Column(String, nullable=True)
    workplace = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    payslips = relationship("Payslip", back_populates="user")
    shifts = relationship("Shift", back_populates="user")

class Payslip(Base):
    __tablename__ = "payslips"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    work_hours = Column(Float)
    gross_salary = Column(Float)
    deductions_total = Column(Float)
    net_salary = Column(Float)
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="payslips")

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    hours = Column(Float)
    title = Column(String, nullable=False, default="Vagt")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="shifts")
