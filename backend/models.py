from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    navn = Column(String, nullable=False)
    payslips = relationship("PaySlip", back_populates="user")
    shifts = relationship("Shift", back_populates="user")

class PaySlip(Base):
    __tablename__ = "payslips"
    payslip_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    dato = Column(Date, nullable=False)
    arbejdstimer = Column(Float)
    loen_brutto = Column(Float)
    fradrag_total = Column(Float)
    loen_netto = Column(Float)
    fil_sti = Column(String)
    user = relationship("User", back_populates="payslips")

class Shift(Base):
    __tablename__ = "shifts"
    shift_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    dato = Column(Date, nullable=False)
    start_tid = Column(DateTime)
    slut_tid = Column(DateTime)
    timer = Column(Float)
    user = relationship("User", back_populates="shifts")
