import os
import uuid
from fastapi import UploadFile, HTTPException
from typing import List, Dict, Any
from app.config import settings

class DocumentProcessor:
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
    
    @staticmethod
    def validate_file(file: UploadFile) -> bool:
        """Validerer at filen er i et acceptabelt format."""
        if not file.filename:
            raise HTTPException(status_code=400, detail="Ingen fil uploaded")
            
        ext = file.filename.split('.')[-1].lower()
        if ext not in DocumentProcessor.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Filformat ikke understøttet. Tilladt: {', '.join(DocumentProcessor.ALLOWED_EXTENSIONS)}")
        return True
    
    @staticmethod
    async def save_temp_file(file: UploadFile) -> str:
        """Gemmer filen midlertidigt og returnerer filstien."""
        temp_dir = settings.UPLOAD_FOLDER
        os.makedirs(temp_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        ext = file.filename.split('.')[-1].lower()
        filepath = os.path.join(temp_dir, f"{file_id}.{ext}")
        
        content = await file.read()
        with open(filepath, "wb") as buffer:
            buffer.write(content)
        
        return filepath
