from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.document_processor import DocumentProcessor
from app.services.ocr_service import OCRService
from app.services.parser_service import ParserService
from app.services.validator_service import ValidatorService
from app.services.ical_service import ICalService
from app.models.validation import ValidationResult
from app.config import settings
import json
import os
from datetime import datetime, timedelta
import requests
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

app = FastAPI(title=settings.PROJECT_NAME)

# Print the CORS origins being used
print(f"--- Initializing CORS with origins: {settings.CORS_ORIGINS} ---")

# Tillad CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser services
document_processor = DocumentProcessor()
ocr_service = OCRService()
parser_service = ParserService()
validator_service = ValidatorService()

# Model for shifts
class ShiftEvent(BaseModel):
    id: str
    title: str
    start: str  # ISO8601 datetime string
    end: str    # ISO8601 datetime string
    allDay: Optional[bool] = None

@app.get("/")
async def root():
    return {"status": "API er online", "version": "0.1.0"}

@app.get("/api/v1/users")
async def get_users():
    """Hent liste over brugere"""
    try:
        # Læs brugere fra dummyUsers.json
        users_file_path = os.path.join(os.path.dirname(__file__), "dummyUsers.json")
        with open(users_file_path, "r", encoding="utf-8") as f:
            users = json.load(f)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kunne ikke hente brugere: {str(e)}")

@app.get("/api/v1/users/{user_id}")
async def get_user(user_id: str):
    """Hent en specifik bruger baseret på bruger-ID"""
    try:
        # Læs brugere fra dummyUsers.json
        users_file_path = os.path.join(os.path.dirname(__file__), "dummyUsers.json")
        with open(users_file_path, "r", encoding="utf-8") as f:
            users = json.load(f)
        
        # Find den specifike bruger
        for user in users:
            if user["user_id"] == user_id:
                return user
        
        # Hvis brugeren ikke findes
        raise HTTPException(status_code=404, detail=f"Bruger med id {user_id} blev ikke fundet")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kunne ikke hente bruger: {str(e)}")

@app.get("/api/v1/users/{user_id}/shifts", response_model=List[ShiftEvent])
async def get_user_shifts(user_id: str):
    """Hent vagter for en specifik bruger baseret på bruger-ID"""
    try:
        # Læs brugere fra dummyUsers.json
        users_file_path = os.path.join(os.path.dirname(__file__), "dummyUsers.json")
        with open(users_file_path, "r", encoding="utf-8") as f:
            users = json.load(f)
        
        # Find den specifike bruger og ics_url
        user = None
        for u in users:
            if u["user_id"] == user_id:
                user = u
                break
        
        if not user:
            raise HTTPException(status_code=404, detail=f"Bruger med id {user_id} blev ikke fundet")
        
        # Hvis brugeren ikke har en ics_url
        if not user.get("ics_url"):
            # Returner dummy data
            return [
                ShiftEvent(
                    id="dummy1",
                    title="Dagvagt",
                    start=(datetime.now() + timedelta(days=1)).isoformat(),
                    end=(datetime.now() + timedelta(days=1, hours=8)).isoformat()
                ),
                ShiftEvent(
                    id="dummy2",
                    title="Aftenvagt",
                    start=(datetime.now() + timedelta(days=3)).isoformat(),
                    end=(datetime.now() + timedelta(days=3, hours=8)).isoformat()
                )
            ]
        
        # Brug ICalService til at hente og parse kalenderdata
        ical_text = await ICalService.fetch_ical_data(user["ics_url"])
        if not ical_text:
            raise HTTPException(status_code=500, detail="Kunne ikke hente kalenderdata")
            
        events = await ICalService.parse_ical_data(ical_text)
        if not events:
            # Returner tomme vagter hvis der ikke blev fundet nogen
            return []
            
        return events
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kunne ikke hente vagter: {str(e)}")

@app.post("/api/v1/upload", response_model=ValidationResult)
async def upload_document(file: UploadFile = File(...)):
    """Upload og analyser en lønseddel."""
    try:
        # Valider filen
        document_processor.validate_file(file)
        
        # Gem filen midlertidigt
        file_path = await document_processor.save_temp_file(file)
        
        # Behandl filen med OCR
        ocr_text = ocr_service.process_document(file_path)
        
        # Parser teksten til struktureret data
        raw_payslip_data = parser_service.parse_payslip(ocr_text)
        
        # Valider lønseddeldata (validator now returns a dict)
        validation_outcome = validator_service.validate_payslip(raw_payslip_data)
        is_valid = validation_outcome["valid"]
        validation_issues = validation_outcome["issues"]

        # Convert the original raw payslip data dict to JSON string
        payslip_data_json = None
        if raw_payslip_data: # Check if data exists
            print("--- Attempting to serialize raw_payslip_data dictionary ---") # Log before trying
            try:
                # Use default=str to handle potential non-serializable types like Decimal or date/time
                payslip_data_json = json.dumps(raw_payslip_data, indent=2, default=str) 
                print("--- Successfully serialized raw_payslip_data --- ") # Log success
            except Exception as e: # Catch ANY exception during serialization
                print(f"!!! CRITICAL: Error serializing raw_payslip_data: {type(e).__name__}: {e} !!!")
                print("--- Failing data causing serialization error: ---")
                try:
                    print(raw_payslip_data) 
                except Exception as print_e:
                     print(f"(Could not print raw data due to: {print_e})")
                print("--- End of failing data ---")
                payslip_data_json = None

        # Create the final result object using the outcome from the validator
        # and the serialized raw data
        final_result = ValidationResult(
            valid=is_valid,
            issues=validation_issues,
            payslip_data=payslip_data_json
        )

        # DEBUG: Print the final result (with JSON string) before returning
        print("--- Final Validation Result START ---")
        print(final_result)
        print("--- Final Validation Result END ---")
        
        return final_result # Return the object with payslip_data as JSON string
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
