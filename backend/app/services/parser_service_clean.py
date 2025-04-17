import os
from typing import Dict, Any
import json
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class ParserService:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY not found in environment variables")
        self.model = "mistral-medium"

    def parse_payslip(self, ocr_text: str) -> Dict[str, Any]:
        """Parser lønseddeldata med Mistral LLM og returnerer struktureret JSON."""
        json_str = ""
        try:
            prompt = f"""Du er en specialiseret assistent, der analyserer danske lønsedler.
Din opgave er at udtrække følgende nøgleoplysninger fra en lønseddel og strukturere dem i JSON-format:

1. Grundlæggende information:
   - Arbejdsgiver (navn)
   - Medarbejder (navn)
   - CPR-nummer (kun de første 6 cifre, sidste 4 cifre skal maskeres)
   - Løndato/periode
   - Ansættelsestype (fuldtid/deltid)

2. Indkomstoplysninger:
   - Bruttoløn (før skat)
   - Timeløn (hvis angivet)
   - Antal arbejdstimer
   - Tillæg (f.eks. aften-, weekend-, helligdags-)
   - Overtid (timer og beløb)

3. Fradrag:
   - A-skat
   - AM-bidrag
   - Pension (medarbejderbidrag)
   - Pension (arbejdsgiverbidrag)
   - Andre fradrag

4. Nettoløn og udbetalte beløb:
   - Nettoløn (udbetalt beløb)

5. Opsummering:
   - Arbejdstimer i alt
   - Brutto årsløn til dato
   - Skat betalt til dato
   - Feriedage til gode/afholdt

Formater resultatet som et enkelt JSON-objekt med disse hovedkategorier.
Hvis du ikke kan finde en speciel værdi, angiv den som null.
Hvis der er yderligere felter, der ser vigtige ud, tilføj dem under den relevante kategori.
Alle tal skal være numeriske (ikke strenge) - fjern enheder og valutasymboler.

OCR-tekst:
{ocr_text}

Returner kun JSON-objektet uden forklarende tekst.
"""
            
            messages = [
                ChatMessage(role="user", content=prompt)
            ]
            
            logger.info("Sending request to Mistral API...")
            client = MistralClient(api_key=self.api_key)
            chat_response = client.chat(
                model=self.model,
                messages=messages,
            )
            logger.info("Received response from Mistral API.")
            
            response_content = chat_response.choices[0].message.content
            logger.debug(f"Raw Mistral response content:\n{response_content}")
            
            # Clean up the string to get potential JSON
            json_str = response_content.strip()
            if json_str.startswith("```json"):
                json_str = json_str[7:]
            if json_str.endswith("```"):
                json_str = json_str[:-3]
            json_str = json_str.strip()
            
            # Remove invalid backslash escapes before underscores
            json_str = json_str.replace('\\_', '_') 
            
            logger.debug(f"Attempting to parse cleaned JSON:\n{json_str}")
            
            # Attempt to parse
            parsed_data = json.loads(json_str)
            logger.info("Successfully parsed JSON from Mistral response.")
            return parsed_data
            
        except json.JSONDecodeError as json_err:
            logger.error(f"JSONDecodeError: {json_err}")
            logger.error(f"Problematic JSON string received from LLM (after cleaning attempts):\n{json_str}")
            raise Exception(f"Parsing-fejl: Kunne ikke parse JSON fra LLM - {json_err}") from json_err
        except Exception as e:
            logger.error(f"An unexpected error occurred in parse_payslip: {e}", exc_info=True)
            raise Exception(f"Parsing-fejl: {str(e)}") 