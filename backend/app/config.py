import os
from dotenv import load_dotenv

# Indlæs miljøvariabler fra .env-fil
load_dotenv()

class Settings:
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PayTjek API"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # API nøgler
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")
    
    # CORS
    # Default to allow the Vite dev server port
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    
    # Dokumenthåndtering
    UPLOAD_FOLDER: str = "temp_uploads"
    MAX_CONTENT_LENGTH: int = 10 * 1024 * 1024  # 10 MB

settings = Settings()
