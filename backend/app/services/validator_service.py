from typing import Dict, Any, List, Union
from app.models.validation import ValidationResult, ValidationIssue
import logging

logger = logging.getLogger(__name__)

# Helper function to safely get a numerical value from potentially nested dict or direct value
def get_numerical_value(data: Any, key: str, default: float = 0.0) -> float:
    value = data.get(key) if isinstance(data, dict) else None
    if value is None:
        logger.warning(f"Key '{key}' not found or data is not a dict. Data: {data}")
        return default
        
    if isinstance(value, (int, float)):
        return float(value)
    elif isinstance(value, dict):
        # Try common keys for amount within a nested dict, including 'samlet'
        for amount_key in ['amount', 'beløb', 'value', 'samlet']:
            if amount_key in value and isinstance(value[amount_key], (int, float)):
                logger.info(f"Extracted value using key '{amount_key}' from nested dict for original key '{key}'.")
                return float(value[amount_key])
        logger.warning(f"Could not find a numerical amount key (amount, beløb, value, samlet) in nested dict for key '{key}'. Value: {value}")
        return default
    else:
        # Attempt to convert string representation of number
        try:
            return float(value)
        except (ValueError, TypeError):
             logger.warning(f"Value for key '{key}' is not a number, parsable dict, or convertible string. Value: {value}, Type: {type(value)}")
             return default

class ValidatorService:
    def __init__(self):
        # I en fuld implementering ville vi indlæse overenskomstregler her
        pass
    
    def validate_payslip(self, payslip_data: Dict[str, Any]) -> Dict[str, bool]:
        """Validerer lønseddeldata mod overenskomstregler og love."""
        issues = []
        
        if not isinstance(payslip_data, dict):
            logger.error(f"payslip_data is not a dictionary: {type(payslip_data)}")
            issues.append(ValidationIssue(
                field="payslip_data",
                issue_type="invalid_format",
                description="Parsed payslip data is not in the expected dictionary format.",
                severity="error"
            ))
            return {"valid": False, "issues": issues}

        # Safely get nested dictionaries first
        indkomst_data = payslip_data.get('indkomstoplysninger', {}) if isinstance(payslip_data, dict) else {}
        fradrag_data = payslip_data.get('fradrag', {}) if isinstance(payslip_data, dict) else {}
        # We still attempt to get feriepenge from top level, as its location is unclear
        # If it's nested elsewhere, this needs adjustment
        feriepenge = get_numerical_value(payslip_data, "feriepenge") 

        # Safely get numerical values from the correct nested locations
        # Corrected key from 'bruttoløn' to 'bruttolon' based on actual data
        bruttoløn = get_numerical_value(indkomst_data, "bruttolon")
        
        # Try getting tax values with underscore first (as seen in data), then hyphen
        a_skat = get_numerical_value(fradrag_data, "a_skat")
        if a_skat == 0.0 and isinstance(fradrag_data, dict) and "A-skat" in fradrag_data: # Fallback to hyphenated if needed
             a_skat = get_numerical_value(fradrag_data, "A-skat")

        am_bidrag = get_numerical_value(fradrag_data, "am_bidrag")
        # Note: AM-bidrag is often negative in payslips, get_numerical_value handles this.
        # Check if key exists before fallback
        if am_bidrag == 0.0 and isinstance(fradrag_data, dict) and "AM-bidrag" in fradrag_data: 
             am_bidrag = get_numerical_value(fradrag_data, "AM-bidrag")

        # --- Validation Logic using safe values --- 
        
        # Feriepenge check
        if bruttoløn > 0: # Avoid division by zero or meaningless checks
            expected_feriepenge = bruttoløn * 0.125
            # Allow for small rounding differences (e.g., 1 DKK)
            if feriepenge < (expected_feriepenge - 1): 
                issues.append(ValidationIssue(
                    field="feriepenge",
                    issue_type="below_threshold",
                    description=f"Feriepenge ({feriepenge:.2f}) ser ud til at være under standard 12.5% af bruttoløn ({expected_feriepenge:.2f}) eller mangler.",
                    severity="warning"
                ))
        
        # A-skat check (more robust)
        if bruttoløn > 0: # Only check if gross pay is positive
            # Use a slightly wider range and check absolute value for flexibility
            # Check if a_skat is not None before performing calculations
            if a_skat is not None and (a_skat < 0 or a_skat < bruttoløn * 0.3 or a_skat > bruttoløn * 0.55): 
                issues.append(ValidationIssue(
                    field="fradrag.a_skat/A-skat",
                    issue_type="unusual_value",
                    description=f"A-skat ({a_skat:.2f}) ser usædvanlig ud ift. bruttoløn ({bruttoløn:.2f}). Forventet interval ca. 30-55% og positivt.",
                    severity="warning"
                ))
        
        # AM-bidrag check (more robust)
        if bruttoløn > 0:
            # AM-bidrag should be around 8% of gross pay. It's often represented as negative.
            expected_am_bidrag = bruttoløn * 0.08
            # Compare absolute values for robustness, allow small difference (e.g., 1 DKK)
            if abs(abs(am_bidrag) - expected_am_bidrag) > 1.0: 
                issues.append(ValidationIssue(
                    field="fradrag.am_bidrag/AM-bidrag",
                    issue_type="incorrect_value",
                    description=f"AM-bidrag ({am_bidrag:.2f}) er ikke tæt på 8% af bruttoløn ({expected_am_bidrag:.2f}).",
                    severity="error"
                ))
        
        # I den fulde implementering ville vi have mange flere regler
        
        # Return only validation status and issues, not the raw data
        return {"valid": len(issues) == 0, "issues": issues}
