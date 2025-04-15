import os
from typing import Dict, Any
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
from app.config import settings

class OCRService:
    def __init__(self):
        # Initialiser OCR-model
        self.model = ocr_predictor(pretrained=True)
    
    def process_document(self, file_path: str) -> str:
        """Behandler et dokument og returnerer den ekstraherede tekst."""
        try:
            # Load document
            doc = DocumentFile.from_pdf(file_path) if file_path.endswith('.pdf') else DocumentFile.from_images(file_path)
            
            # Perform OCR
            result = self.model(doc)
            
            # Extract text from result
            extracted_text = result.export()
            
            # Konverter OCR-resultat til en tekst-streng
            full_text = ""
            for page in extracted_text["pages"]:
                for block in page["blocks"]:
                    for line in block["lines"]:
                        line_text = " ".join([word["value"] for word in line["words"]])
                        full_text += line_text + "\n"
            
            return full_text
        
        except Exception as e:
            raise Exception(f"OCR-fejl: {str(e)}")
        finally:
            # Ryd op efter os selv - men lad os vente med sletning i udviklingsmiljø for at lette fejlfinding
            # Check if settings is defined and DEBUG is True before checking file existence
            if hasattr(settings, 'DEBUG') and not settings.DEBUG and os.path.exists(file_path):
                 os.remove(file_path)
            elif not hasattr(settings, 'DEBUG') and os.path.exists(file_path):
                 # Default behavior if DEBUG is not set: remove the file
                 os.remove(file_path)
