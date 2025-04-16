from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class Tax(BaseModel):
    a_skat: float
    am_bidrag: float
    other_taxes: Optional[Dict[str, float]] = None

class Pension(BaseModel):
    employee_contribution: float
    employer_contribution: float
    total: float

class Payslip(BaseModel):
    employer_name: str
    employee_name: str
    date: str
    period: str
    gross_salary: float
    net_salary: float
    hours_worked: Optional[float] = None
    hourly_rate: Optional[float] = None
    tax: Tax
    pension: Optional[Pension] = None
    vacation_pay: Optional[float] = None
    supplements: Optional[List[Dict[str, Any]]] = None
    deductions: Optional[List[Dict[str, Any]]] = None
