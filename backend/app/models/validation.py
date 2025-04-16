from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ValidationIssue(BaseModel):
    field: str
    issue_type: str
    description: str
    severity: str  # 'info', 'warning', 'error'

class ValidationResult(BaseModel):
    valid: bool
    issues: List[ValidationIssue]
    payslip_data: Optional[str] = None
