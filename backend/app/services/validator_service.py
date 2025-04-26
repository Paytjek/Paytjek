from typing import Dict, Any, List, Union, Optional
from app.models.validation import ValidationResult, ValidationIssue
import logging

logger = logging.getLogger(__name__)

# Helper function to safely get a value, with clear path logging
def get_value(data: Any, path: str, default=None):
    """Get a value from a nested dictionary using dot notation for the path."""
    try:
        parts = path.split('.')
        current = data
        for part in parts:
            if not isinstance(current, dict):
                logger.warning(f"Cannot access '{part}' in '{path}': parent is not a dict but {type(current)}")
                return default
            if part not in current:
                logger.warning(f"Key '{part}' not found in path '{path}'")
                return default
            current = current[part]
        return current
    except Exception as e:
        logger.warning(f"Error accessing path '{path}': {str(e)}")
        return default

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

# Function to get value from any possible location in payslip data
def get_value_from_payslip(data: Dict[str, Any], possible_paths: List[str], default: Any = None) -> Any:
    """
    Try to get a value from multiple possible paths in payslip data.
    
    Args:
        data: The payslip data dictionary
        possible_paths: List of possible json paths to try
        default: Default value to return if not found
        
    Returns:
        The found value or default if not found
    """
    for path in possible_paths:
        try:
            parts = path.split('.')
            current = data
            
            for part in parts:
                if not isinstance(current, dict):
                    break
                if part not in current:
                    break
                current = current[part]
            else:
                # If we got here, we found the value
                if current is not None:
                    logger.debug(f"Found value at path: {path}")
                    return current
        except Exception as e:
            logger.debug(f"Error accessing path {path}: {str(e)}")
            continue
    
    logger.debug(f"Could not find value in any of the paths: {possible_paths}")
    return default

class ValidatorService:
    def __init__(self):
        logger.info("Initializing ValidatorService")
    
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

        # Check for required sections
        required_sections = ["metadata", "løn"]
        for section in required_sections:
            if section not in payslip_data or not isinstance(payslip_data[section], dict):
                issues.append(ValidationIssue(
                    field=section,
                    issue_type="missing_section",
                    description=f"Required section '{section}' is missing or invalid.",
                    severity="error"
                ))
        
        # Check for critical metadata
        metadata = payslip_data.get('metadata', {})
        critical_metadata = ['periode', 'navn']
        for field in critical_metadata:
            if not metadata.get(field):
                issues.append(ValidationIssue(
                    field=f"metadata.{field}",
                    issue_type="missing_field",
                    description=f"Critical metadata field '{field}' is missing.",
                    severity="warning"
                ))
        
        # Extract financial values with multiple possible paths
        bruttoløn = get_value_from_payslip(payslip_data, [
            'løn.samlet_løn_før_skat',
            'bruttolon.beløb',
            'løn.brutto',
            'indkomstoplysninger.bruttolon'
        ])
        
        if isinstance(bruttoløn, str):
            try:
                bruttoløn = float(bruttoløn.replace('.', '').replace(',', '.'))
            except (ValueError, TypeError):
                bruttoløn = 0
        
        feriepenge = get_value_from_payslip(payslip_data, [
            'feriepenge.optjent',
            'ferie.feriegodtgørelse_fond',
            'feriepenge'
        ])
        
        if isinstance(feriepenge, str):
            try:
                feriepenge = float(feriepenge.replace('.', '').replace(',', '.'))
            except (ValueError, TypeError):
                feriepenge = 0
        
        a_skat = get_value_from_payslip(payslip_data, [
            'løn.skat.skat',
            'a_skat.beløb',
            'fradrag.a_skat',
            'fradrag.A-skat'
        ])
        
        if isinstance(a_skat, str):
            try:
                a_skat = float(a_skat.replace('.', '').replace(',', '.'))
            except (ValueError, TypeError):
                a_skat = 0
        
        am_bidrag = get_value_from_payslip(payslip_data, [
            'løn.skat.arbejdsmarkedsbidrag',
            'am_bidrag.beløb',
            'fradrag.am_bidrag',
            'fradrag.AM-bidrag'
        ])
        
        if isinstance(am_bidrag, str):
            try:
                am_bidrag = float(am_bidrag.replace('.', '').replace(',', '.'))
            except (ValueError, TypeError):
                am_bidrag = 0
        
        # Ensure numerical values are positive where appropriate
        if bruttoløn and bruttoløn < 0:
            issues.append(ValidationIssue(
                field="bruttoløn",
                issue_type="negative_value",
                description=f"Bruttoløn ({bruttoløn:.2f}) cannot be negative.",
                severity="error"
            ))
        
        # --- Validation Logic using safe values --- 
        
        # Validate only if we have required values
        if bruttoløn and bruttoløn > 0:
            # Feriepenge check
            expected_feriepenge = bruttoløn * 0.125
            # Allow for small rounding differences (e.g., 1 DKK)
            if feriepenge and feriepenge < (expected_feriepenge - 1): 
                issues.append(ValidationIssue(
                    field="feriepenge",
                    issue_type="below_threshold",
                    description=f"Feriepenge ({feriepenge:.2f}) ser ud til at være under standard 12.5% af bruttoløn ({expected_feriepenge:.2f}) eller mangler.",
                    severity="warning"
                ))
        
            # A-skat check (more robust)
            # Use a slightly wider range and check absolute value for flexibility
            if a_skat is not None:
                if a_skat < 0 or a_skat < bruttoløn * 0.3 or a_skat > bruttoløn * 0.55: 
                    issues.append(ValidationIssue(
                        field="a_skat",
                        issue_type="unusual_value",
                        description=f"A-skat ({a_skat:.2f}) ser usædvanlig ud ift. bruttoløn ({bruttoløn:.2f}). Forventet interval ca. 30-55% og positivt.",
                        severity="warning"
                    ))
        
            # AM-bidrag check (more robust)
            if am_bidrag is not None:
                # AM-bidrag should be around 8% of gross pay
                expected_am_bidrag = bruttoløn * 0.08
                # Handle both positive and negative AM-bidrag representations
                am_bidrag_abs = abs(am_bidrag)
                # Allow small difference (e.g., 1 DKK or 10%)
                difference = abs(am_bidrag_abs - expected_am_bidrag)
                if difference > 1.0 and difference > expected_am_bidrag * 0.1:
                    issues.append(ValidationIssue(
                        field="am_bidrag",
                        issue_type="incorrect_value",
                        description=f"AM-bidrag ({am_bidrag:.2f}) er ikke tæt på 8% af bruttoløn ({expected_am_bidrag:.2f}).",
                        severity="warning"
                    ))
        
        # Check specific fields for Region Hovedstaden payslips
        løn_data = payslip_data.get('løn', {})
        
        # Check if any arbejdstimer are defined
        arbejdstimer = payslip_data.get('arbejdstimer', [])
        if not arbejdstimer:
            issues.append(ValidationIssue(
                field="arbejdstimer",
                issue_type="missing_data",
                description="Ingen arbejdstimer fundet i lønsedlen. Dette er nødvendigt for kalenderfunktionen.",
                severity="warning"
            ))
        
        # Return only validation status and issues, not the raw data
        return {"valid": len([i for i in issues if i.severity == "error"]) == 0, "issues": issues}
    
    def _validate_metadata(self, data: Dict[str, Any], issues: List[ValidationIssue]):
        """Validate required metadata fields."""
        required_fields = ["periode", "navn", "arbejdsplads"]
        for field in required_fields:
            if not get_value(data, f"metadata.{field}"):
                issues.append(ValidationIssue(
                    field=f"metadata.{field}",
                    issue_type="missing_field",
                    description=f"Required metadata field '{field}' is missing or empty.",
                    severity="warning"
                ))
    
    def _validate_salary(self, data: Dict[str, Any], issues: List[ValidationIssue]):
        """Validate salary section fields."""
        # Check if basic salary info exists
        if not get_value(data, "løn.samlet_løn_før_skat"):
            issues.append(ValidationIssue(
                field="løn.samlet_løn_før_skat",
                issue_type="missing_field",
                description="Total gross salary is missing or zero.",
                severity="error"
            ))
        
        # Check if salary details exist
        if not get_value(data, "løn.grundløn"):
            issues.append(ValidationIssue(
                field="løn.grundløn",
                issue_type="missing_field",
                description="Base salary information is missing.",
                severity="warning"
            ))
        
        # Check if net amount exists
        if not get_value(data, "løn.netto_udbetalt"):
            issues.append(ValidationIssue(
                field="løn.netto_udbetalt", 
                issue_type="missing_field",
                description="Net salary amount is missing.",
                severity="warning"
            ))
    
    def _validate_pension(self, data: Dict[str, Any], issues: List[ValidationIssue]):
        """Validate pension section fields."""
        if not get_value(data, "pension.samlet_pensionsbidrag"):
            issues.append(ValidationIssue(
                field="pension.samlet_pensionsbidrag",
                issue_type="missing_field",
                description="Total pension contribution is missing.",
                severity="warning"
            ))
    
    def _validate_vacation(self, data: Dict[str, Any], issues: List[ValidationIssue]):
        """Validate vacation section fields."""
        # At least one vacation field should exist
        vacation_fields = [
            "ferie.ferie_med_løn_saldo", 
            "ferie.feriegodtgørelse_fond",
            "feriepenge.optjent"
        ]
        
        if not any(get_value(data, field) for field in vacation_fields):
            issues.append(ValidationIssue(
                field="ferie",
                issue_type="missing_data",
                description="No vacation balance or earned vacation pay information found.",
                severity="warning"
            ))
    
    def _validate_numerical_values(self, data: Dict[str, Any], issues: List[ValidationIssue]):
        """Validate numerical values for reasonable ranges and relationships."""
        # Get key numerical values
        bruttoløn = get_numerical_value(data, "løn.samlet_løn_før_skat")
        if not bruttoløn:
            bruttoløn = get_numerical_value(data, "bruttolon.beløb")
        
        # Skip validation if no valid gross salary
        if not bruttoløn or bruttoløn <= 0:
            return
        
        # Validate vacation pay (approx 12.5% of gross salary)
        feriepenge = get_numerical_value(data, "feriepenge.optjent") 
        if not feriepenge:
            feriepenge = get_numerical_value(data, "ferie.feriegodtgørelse_fond")
        
        if feriepenge and feriepenge > 0:
            expected_feriepenge = bruttoløn * 0.125
            # Allow for small rounding differences
            if feriepenge < (expected_feriepenge - 1):
                issues.append(ValidationIssue(
                    field="feriepenge",
                    issue_type="below_threshold",
                    description=f"Feriepenge ({feriepenge:.2f}) ser ud til at være under standard 12.5% af bruttoløn ({expected_feriepenge:.2f}).",
                    severity="warning"
                ))
        
        # Validate tax (A-skat)
        a_skat = get_numerical_value(data, "løn.skat.skat")
        if not a_skat:
            a_skat = get_numerical_value(data, "fradrag.a_skat")
            if not a_skat:
                a_skat = get_numerical_value(data, "fradrag.A-skat")
                if not a_skat:
                    a_skat = get_numerical_value(data, "a_skat.beløb")
        
        if a_skat and (a_skat < 0 or a_skat < bruttoløn * 0.3 or a_skat > bruttoløn * 0.55):
            issues.append(ValidationIssue(
                field="a_skat",
                issue_type="unusual_value",
                description=f"A-skat ({a_skat:.2f}) ser usædvanlig ud ift. bruttoløn ({bruttoløn:.2f}). Forventet interval ca. 30-55% og positivt.",
                severity="warning"
            ))
        
        # Validate AM-bidrag (should be around 8% of gross salary)
        am_bidrag = get_numerical_value(data, "løn.skat.arbejdsmarkedsbidrag")
        if not am_bidrag:
            am_bidrag = get_numerical_value(data, "fradrag.am_bidrag")
            if not am_bidrag:
                am_bidrag = get_numerical_value(data, "fradrag.AM-bidrag")
                if not am_bidrag:
                    am_bidrag = get_numerical_value(data, "am_bidrag.beløb")
        
        if am_bidrag:
            expected_am_bidrag = bruttoløn * 0.08
            # Compare absolute values to handle negative representation
            if abs(abs(am_bidrag) - expected_am_bidrag) > 1.0:
                issues.append(ValidationIssue(
                    field="am_bidrag",
                    issue_type="incorrect_value",
                    description=f"AM-bidrag ({am_bidrag:.2f}) er ikke tæt på 8% af bruttoløn ({expected_am_bidrag:.2f}).",
                    severity="warning"
                ))