import os
from typing import Dict, Any
import json
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from app.config import settings
import logging
import pprint

logger = logging.getLogger(__name__)
# Set logging level to DEBUG to capture all log messages
logger.setLevel(logging.DEBUG)

class ParserService:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY not found in environment variables")
        self.model = "mistral-medium"

    def parse_payslip(self, ocr_text: str) -> Dict[str, Any]:
        """Parser lønseddeldata med Mistral LLM og returnerer struktureret JSON."""
        try:
            # Log the received OCR text (truncated for brevity)
            logger.info(f"Parsing lønseddel med OCR-tekst (første 100 tegn): {ocr_text[:100]}...")
            
            # JSON-skabelon til outputformat
            json_template = {
                "metadata": {
                    "periode": None,
                    "cpr_nr": None,
                    "navn": None,
                    "adresse": None,
                    "arbejdsplads": None,
                    "tjenestenr": None,
                    "lønseddel_nr": None,
                    "overenskomst": None,
                    "anciennitetsdato": None,
                    "jubilæumsdato": None,
                    "næste_løntrinsstigning": None,
                    "område": None
                },
                "løn": {
                    "grundløn": {"trin": None, "beløb": None, "timer_pr_uge": None},
                    "tillæg": [],
                    "fast_løn_i_alt": None,
                    "særydelser": [],
                    "fradrag": [],
                    "samlet_løn_før_skat": None,
                    "skat": {"arbejdsmarkedsbidrag": None, "trækprocent": None, "fradrag": None, "skat": None},
                    "netto_udbetalt": None,
                    "overførsel_dato": None
                },
                "pension": {"samlet_pensionsbidrag": None, "eget_bidrag": None, "pensionsprocent": None},
                "ferie": {"ferie_med_løn_saldo": None, "ferie_uden_løn_saldo": None, "6_uge": None, "feriegodtgørelse_fond": None,
                          "feriegodtgørelse_ekstra_tj": None, "ferietillæg_maj": None},
                "afspadsering": {"saldo_start": None, "optjent_timer": None, "afholdt_timer": None, "saldo_slut": None},
                "arbejdstimer": [],
                "arbejdstimer_ics": [], # ICS-kompatibelt format for arbejdstimer
                # Tilføj de manglende felter som validator kræver
                "feriepenge": {"optjent": None, "udbetalt": None},
                "bruttolon": {"beløb": None, "heraf_pension": None},
                "a_skat": {"beløb": None, "procent": None},
                "am_bidrag": {"beløb": None, "procent": None}
            }

            # Convert the template to JSON with proper indentation
            template_json = json.dumps(json_template, indent=2, ensure_ascii=False)
            
            # Building the prompt without f-strings to avoid format issues
            prompt_part1 = """
Du er en specialiseret assistent, der analyserer danske lønsedler.
Din opgave er at udtrække alle nøgleoplysninger og formatere dem som JSON i nøjagtigt samme struktur som denne skabelon:
"""
            
            prompt_part2 = """

# Analyseproces
1. Læs HELE lønseddelteksten grundigt igennem for at få overblik over dokumentet.
2. Vær opmærksom på den komplekse struktur af lønsedler - de kan have både forside og bagside med vigtige detaljer.
3. Identificer alle sektioner: metadata, løndele, ferie, afspadsering og især arbejdstimer fra arbejdstidsopgørelsen.
4. Udtryk alle beløb som tal uden tusindtalsadskiller og med punktum som decimaltegn.
5. Konverter og standardiser alle data efter retningslinjerne nedenfor.

# Vigtige dokumentsektioner at finde
1. Hovedsektion med grundoplysninger (typisk øverst på første side)
2. Periode og metadata (CPR, navn, adresse, arbejdsplads, tjenestenr osv.)
3. Lønsektioner: grundløn, tillæg, særydelser, fradrag
4. Ferieregnskab og feriegodtgørelser (ofte på bagside)
5. Afspadseringsregnskab (typisk på bagsiden)
6. Arbejdstidsopgørelse eller optælling af timer (detaljeret oversigt over alle arbejdsdage)

# Vigtige detaljer at fokusere på

## Metadata
- periode: Perioden lønsedlen dækker (f.eks. "august 2024" eller "01.08-31.08.2024")
- cpr_nr: CPR-nummer - find formatet XXXXXX-XXXX (f.eks. "080498-0075")
- navn: Medarbejderens fulde navn (f.eks. "Ernst Cæsius Jakobsen Krohn")
- adresse: Komplet adresse med gade, nummer, etage og postnummer/by
- arbejdsplads: Arbejdspladsens fulde navn (f.eks. "Region Hovedstadens Psykiatri")
- tjenestenr: Tjenestenummer - søg efter "Tjenestenr" eller "Tjnr" (f.eks. "15893")
- lønseddel_nr: Lønseddelnummer format MM/ÅÅÅÅ (f.eks. "08/2024")
- overenskomst: Overenskomstoplysninger (f.eks. "Ikke-ledende personale på SHK-området")
- anciennitetsdato: Dato for anciennitet (f.eks. "01.08.2024")
- jubilæumsdato: Dato for jubilæum (f.eks. "25.08.2022")
- næste_løntrinsstigning: Dato for næste løntrinsstigning (f.eks. "01.08.2028")
- område: Områdenummer (f.eks. "4")

## Løn
- grundløn: Objekt med:
  - trin: Løntrinnet (f.eks. "04")
  - beløb: Beløbet uden tusindtalsadskiller (f.eks. 24559.41)
  - timer_pr_uge: Timer pr. uge (f.eks. 32)
- tillæg: Liste af tillæg med type og beløb. Hvert tillæg er et objekt med:
  - type: Beskrivelse af tillægget (f.eks. "Lukket afsnit/afd. PV")
  - beløb: Beløb uden tusindtalsadskiller (f.eks. 1751.08)
  - pensionsgivende: true hvis markeret med "P", ellers false
- fast_løn_i_alt: Samlet fast løn (f.eks. 27477.38)
- særydelser: Liste over særydelser. Hver særydelse er et objekt med:
  - type: Type særydelse (f.eks. "Ekstratimer" eller "Aftentillæg")
  - antal: Antal enheder (f.eks. 9.0)
  - sats: Sats pr. enhed (f.eks. 154.68)
  - beløb: Samlet beløb (f.eks. 1392.12)
  - pensionsgivende: true hvis markeret med "P", ellers false
- fradrag: Liste over fradrag. Hvert fradrag er et objekt med:
  - type: Type fradrag (f.eks. "Feriefradrag" eller "ATP bidrag")
  - beløb: Beløb (f.eks. -161.18)
- samlet_løn_før_skat: Samlet løn før skat (f.eks. 34957.00)
- skat: Objekt med:
  - arbejdsmarkedsbidrag: Arbejdsmarkedsbidrag beløb (f.eks. 2796.00)
  - trækprocent: Skatteprocent (f.eks. 41)
  - fradrag: Skattefradrag (f.eks. 4694.00)
  - skat: Samlet skattebeløb (f.eks. 11261.00)
- netto_udbetalt: Nettobeløb udbetalt (f.eks. 20900.00)
- overførsel_dato: Dato for overførsel (f.eks. "2024-08-30")

## Pension
- samlet_pensionsbidrag: Samlet pensionsbidrag (f.eks. 9260.85)
- eget_bidrag: Eget bidrag til pension (f.eks. 3086.95)
- pensionsprocent: Pensionsprocent (f.eks. 13.55)

## Ferie
- ferie_med_løn_saldo: Saldo for ferie med løn (f.eks. -13.33)
- ferie_uden_løn_saldo: Saldo for ferie uden løn (f.eks. -4.01)
- 6_uge: Sjette ferieuge (f.eks. 32.00)
- feriegodtgørelse_fond: Feriegodtgørelse til fond (f.eks. 1381.06)
- feriegodtgørelse_ekstra_tj: Feriegodtgørelse af ekstra tjeneste
- ferietillæg_maj: Ferietillæg (f.eks. 508.70)

## Afspadsering
- saldo_start: Saldo ved periodens start
- optjent_timer: Optjente timer i perioden
- afholdt_timer: Afholdte timer i perioden
- saldo_slut: Saldo ved periodens slutning (f.eks. 11.28) - ses under "Tilgodehavende afspadsering"

## Arbejdstimer
For hver dag med arbejdstid fra "Arbejdstidsopgørelse"-sektionen, opret et objekt med:
- dato: Dato i format YYYY-MM-DD (f.eks. "2024-07-10")
- arbejdstid: Arbejdstidsinterval (f.eks. "07:00-15:00")
- normtid: Normtid i timer (f.eks. 8.0)
- fravær: Type fravær hvis relevant (f.eks. "Ferietimer", "Kursustimer" eller null)
- tillæg: Liste af tillæg for denne dag (f.eks. [{"type": "Aftentillæg", "timer": 6.0}])

## Ekstra påkrævede felter
- feriepenge: Udført som objekt med:
  - optjent: Optjente feriepenge - se feriegodtgørelse til fond (f.eks. 1381.06)
  - udbetalt: Udbetalte feriepenge (hvis angivet, ellers null)
- bruttolon: Udført som objekt med:
  - beløb: Samlet bruttoløn - samme som samlet_løn_før_skat (f.eks. 34957.00)
  - heraf_pension: Pensionsbidrag inkluderet i bruttolønnen (f.eks. 9260.85)
- a_skat: Udført som objekt med:
  - beløb: A-skat beløb - samme som skat.skat (f.eks. 11261.00)
  - procent: Skatteprocent - samme som skat.trækprocent (f.eks. 41)
- am_bidrag: Udført som objekt med:
  - beløb: Arbejdsmarkedsbidrag beløb - samme som skat.arbejdsmarkedsbidrag (f.eks. 2796.00)
  - procent: Arbejdsmarkedsbidrag procent (typisk 8.0)

# Særlige formateringsretningslinjer
- Konverter alle beløb til tal uden tusindtalsadskiller og med punktum som decimaltegn.
- Fjern "P" og "*" fra beløb, men registrer deres betydning i objektstrukturen.
- Markering med "P" angiver pensionsgivende beløb - sæt pensionsgivende: true for disse.
- Negative beløb (f.eks. -161.18) skal beholde minustegnet.
- Hvis visse data ikke findes i lønsedlen, sæt værdien til null.
- For datoer, brug formatet YYYY-MM-DD (f.eks. "2024-08-30").

# Særligt fokus på arbejdstidsopgørelsen
- Find sektionen "Arbejdstidsopgørelse" eller "Optælling af timer".
- For hver dato med registreret arbejdstid, ekstrahér det komplette mønster:
  * Dato (konverter til YYYY-MM-DD format)
  * Arbejdstidsinterval (f.eks. "07:00-15:00")
  * Normtid (antal timer)
  * Fraværstype hvis relevant (f.eks. "Ferietimer", "Kursustimer")
  * Eventuelle tillæg (f.eks. "Aftentillæg")
- Registrer også dage med fravær, såsom ferie, kursus eller sygdom.
- I nogle tabeller kan arbejdstid vises uge for uge i datokolonner - vær opmærksom på dette format.

# Vigtige sektioner at søge efter
- "Lønseddel", "Periode", "Løn", "Fast løn", "Særydelser", "Skatteberegning", "Arbejdstidsopgørelse"
- "Specifikation af særydelser", "Ferieregnskab", "Afspadseringsregnskab", "Tilgodehavende afspadsering"
- "Optælling af timer", "Feriegodtgørelser", "Samlet pensionsbidrag"

Returner KUN det endelige JSON-objekt uden forklarende tekst eller kommentarer.

OCR-tekst:
"""
            
            prompt_part3 = """
"""
            
            # Construct the full prompt by concatenation (not f-string)
            prompt = prompt_part1 + template_json + prompt_part2 + ocr_text + prompt_part3
            
            messages = [ChatMessage(role="user", content=prompt)]

            logger.info("Sender request til Mistral API...")
            client = MistralClient(api_key=self.api_key)
            chat_response = client.chat(model=self.model, messages=messages)
            logger.info("Modtog respons fra Mistral API.")
            
            # Log API response details
            logger.debug(f"Mistral API finish_reason: {chat_response.choices[0].finish_reason}")
            logger.debug(f"Mistral API model: {chat_response.model}")

            response_content = chat_response.choices[0].message.content.strip()
            # Log raw content (first 200 chars)
            logger.debug(f"Rå respons fra API (første 200 tegn): {response_content[:200]}...")
            
            # Fjern fenced code blocks hvis eksisterende
            if response_content.startswith("```json"):
                response_content = response_content[7:]
            if response_content.endswith("```"):
                response_content = response_content[:-3]
            response_content = response_content.strip()
            
            # Rens JSON før parsing - fjern kommentarer og anden ikke-valid JSON
            cleaned_json = self._clean_json_string(response_content)
            
            # Parse JSON
            try:
                parsed_data = json.loads(cleaned_json)
            except json.JSONDecodeError as e:
                logger.error(f"Første forsøg på at parse JSON fejlede: {e}")
                # Forsøg at bruge en mere robust JSON-parser som et fallback
                import re
                import ast
                
                # Fjern kommentarer i JSON
                pattern = r'//.*?(?=\n|$)|/\*.*?\*/|\s*//.*?$'
                no_comments = re.sub(pattern, '', cleaned_json, flags=re.DOTALL)
                
                # Erstatter 'null' med 'None', 'true' med 'True', etc.
                no_comments = no_comments.replace('null', 'None').replace('true', 'True').replace('false', 'False')
                
                # Forsøg at parse med ast.literal_eval
                try:
                    parsed_data = ast.literal_eval(no_comments)
                except (SyntaxError, ValueError) as ast_err:
                    logger.error(f"Også fallback parsing fejlede: {ast_err}")
                    raise json.JSONDecodeError(str(e), cleaned_json, e.pos) from e
            
            # Rengør numeriske værdier i parsed_data
            self._clean_numeric_values(parsed_data)
            
            # Log key fields from parsed data
            logger.info(f"Parset data for periode: {parsed_data.get('metadata', {}).get('periode')}")
            logger.info(f"Lønseddel for: {parsed_data.get('metadata', {}).get('navn')}")
            logger.info(f"Arbejdsplads: {parsed_data.get('metadata', {}).get('arbejdsplads')}")
            logger.info(f"Samlet løn før skat: {parsed_data.get('løn', {}).get('samlet_løn_før_skat')}")
            logger.info(f"Netto udbetalt: {parsed_data.get('løn', {}).get('netto_udbetalt')}")
            
            # Log aantal arbejdstimer
            arbejdstimer = parsed_data.get('arbejdstimer', [])
            logger.info(f"Antal registrerede arbejdsdage: {len(arbejdstimer)}")
            if arbejdstimer:
                logger.debug(f"Første arbejdsdag: {pprint.pformat(arbejdstimer[0])}")
            
            # Tilføj manglende felter hvis Mistral ikke har inkluderet dem
            self._ensure_required_fields(parsed_data)
            
            # Hvis arbejdstimer_ics ikke er udfyldt, men arbejdstimer er, så lav dem selv
            if parsed_data.get("arbejdstimer") and not parsed_data.get("arbejdstimer_ics"):
                parsed_data["arbejdstimer_ics"] = self._convert_to_ics_format(parsed_data["arbejdstimer"])
            
            logger.info("Succesfuldt parset JSON fra LLM.")
            logger.debug(f"Komplet parset data: {pprint.pformat(parsed_data)}")
            return parsed_data

        except json.JSONDecodeError as json_err:
            logger.error(f"JSONDecodeError: {json_err}")
            logger.error(f"Problematic content:\n{response_content}")
            raise Exception(f"Parsing-fejl: Kunne ikke parse JSON fra LLM - {json_err}") from json_err
        except Exception as e:
            logger.error("Uventet fejl i parse_payslip:", exc_info=True)
            raise Exception(f"Parsing-fejl: {str(e)}")
    
    def _clean_json_string(self, json_str):
        """Rens en JSON-streng for ugyldige elementer som kommentarer og lignende"""
        import re
        
        # Fjern enkeltlinjekommentarer
        json_str = re.sub(r'//.*?$', '', json_str, flags=re.MULTILINE)
        
        # Fjern blokkommentarer
        json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)
        
        # Fjern kommentarer som "// ... resten af arbejdstiderne"
        json_str = re.sub(r'// \.\.\. .*?$', '', json_str, flags=re.MULTILINE)
        
        # Håndter trailing commas
        json_str = re.sub(r',(\s*[\]}])', r'\1', json_str)
        
        # Fjern usynlige kontroltegn
        json_str = ''.join(ch for ch in json_str if ord(ch) >= 32 or ch in '\n\r\t')
        
        # Håndter decimal-tal med to punktummer (31.805.89 -> 31805.89)
        def fix_numbers(match):
            num_str = match.group(0)
            if num_str.count('.') > 1:
                # Fjern alle punktummer og behold det sidste som decimalseparator
                parts = num_str.split('.')
                return ''.join(parts[:-1]) + '.' + parts[-1]
            return num_str
        
        json_str = re.sub(r'\d+\.\d+\.\d+', fix_numbers, json_str)
        
        return json_str
    
    def _clean_numeric_values(self, data):
        """Rengør numeriske værdier i data strukturen for at sikre korrekt formatering"""
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, str) and key in ['beløb', 'amount', 'sats', 'procent', 'arbejdsmarkedsbidrag', 'skat', 'fradrag', 'fast_løn_i_alt', 'samlet_løn_før_skat', 'netto_udbetalt']:
                    try:
                        # Rengør værdien - fjern tusindtalsadskillere og konverter komma til punktum
                        cleaned_value = value.replace(".", "").replace(",", ".")
                        data[key] = float(cleaned_value)
                    except ValueError:
                        logger.warning(f"Kunne ikke konvertere {key}={value} til tal")
                elif isinstance(value, (dict, list)):
                    self._clean_numeric_values(value)
        elif isinstance(data, list):
            for item in data:
                self._clean_numeric_values(item)
    
    def _ensure_required_fields(self, data):
        """Sikrer at alle påkrævede felter er til stede i outputtet"""
        # Tilføj feriepenge hvis mangler
        if "feriepenge" not in data:
            ferie_data = data.get("ferie", {})
            data["feriepenge"] = {
                "optjent": ferie_data.get("feriegodtgørelse_fond") or ferie_data.get("ferietillæg_maj"),
                "udbetalt": None
            }
        
        # Tilføj bruttolon hvis mangler
        if "bruttolon" not in data:
            løn_data = data.get("løn", {})
            pension_data = data.get("pension", {})
            data["bruttolon"] = {
                "beløb": løn_data.get("samlet_løn_før_skat"),
                "heraf_pension": pension_data.get("samlet_pensionsbidrag")
            }
        
        # Tilføj a_skat hvis mangler
        if "a_skat" not in data:
            skat_data = data.get("løn", {}).get("skat", {})
            data["a_skat"] = {
                "beløb": skat_data.get("skat"),
                "procent": skat_data.get("trækprocent")
            }
        
        # Tilføj am_bidrag hvis mangler
        if "am_bidrag" not in data:
            skat_data = data.get("løn", {}).get("skat", {})
            am_bidrag_beløb = skat_data.get("arbejdsmarkedsbidrag")
            am_procent = 8.0  # Standard procent
            
            # Sikre at am_bidrag_beløb er et gyldigt tal
            if isinstance(am_bidrag_beløb, str):
                try:
                    # Fjern tusindtalsseparatorer og erstat komma med punktum for decimal
                    am_bidrag_beløb = am_bidrag_beløb.replace(".", "").replace(",", ".")
                    am_bidrag_beløb = float(am_bidrag_beløb)
                except ValueError:
                    logger.warning(f"Kunne ikke konvertere am_bidrag_beløb '{am_bidrag_beløb}' til tal")
                    am_bidrag_beløb = None
                    
            if am_bidrag_beløb and data.get("løn", {}).get("samlet_løn_før_skat"):
                # Forsøg at beregne procent hvis vi har både beløb og grundlag
                try:
                    bruttoløn = data.get("løn", {}).get("samlet_løn_før_skat")
                    # Sikre at bruttoløn er et tal
                    if isinstance(bruttoløn, str):
                        bruttoløn = bruttoløn.replace(".", "").replace(",", ".")
                        bruttoløn = float(bruttoløn)
                    
                    am_procent = round((am_bidrag_beløb / bruttoløn) * 100, 1) if bruttoløn else 8.0
                except Exception as e:
                    logger.warning(f"Fejl ved beregning af am_procent: {e}")
                    am_procent = 8.0  # Brug standard hvis beregning fejler
            
            data["am_bidrag"] = {
                "beløb": am_bidrag_beløb,
                "procent": am_procent
            }
    
    def _convert_to_ics_format(self, arbejdstimer):
        """Konverterer arbejdstimer-array til ICS-kompatibelt format"""
        import re
        from datetime import datetime, timedelta
        
        ics_entries = []
        
        for dag in arbejdstimer:
            if not dag.get("dato") or not dag.get("arbejdstid"):
                continue
                
            try:
                # Forsøg at parse datoen
                dato_str = dag["dato"]
                dato = None
                
                # Tjek for forskellige datoformater
                if re.match(r'\d{4}-\d{2}-\d{2}', dato_str):  # ISO format
                    dato = dato_str
                elif re.match(r'\d{2}\.\d{2}\.\d{4}', dato_str):  # DD.MM.YYYY
                    d, m, y = dato_str.split('.')
                    dato = f"{y}-{m}-{d}"
                elif re.match(r'\d{2}\.\d{2}\.\d{2}', dato_str):  # DD.MM.YY
                    d, m, y = dato_str.split('.')
                    dato = f"20{y}-{m}-{d}"
                else:
                    # Prøv at udtrække en dato med regex
                    match = re.search(r'(\d{1,2})[\./-](\d{1,2})[\./-](\d{2,4})', dato_str)
                    if match:
                        d, m, y = match.groups()
                        if len(y) == 2:
                            y = f"20{y}"
                        dato = f"{y}-{m.zfill(2)}-{d.zfill(2)}"
                
                if not dato:
                    continue
                
                # Parse arbejdstid
                arbejdstid = dag["arbejdstid"]
                tid_match = re.match(r'(\d{1,2})[:.:](\d{2})-(\d{1,2})[:.:](\d{2})', arbejdstid)
                
                if tid_match:
                    start_time_h, start_time_m, end_time_h, end_time_m = map(int, tid_match.groups())
                    
                    # Create ICS entry
                    start_iso = f"{dato}T{start_time_h:02d}:{start_time_m:02d}:00"
                    end_iso = f"{dato}T{end_time_h:02d}:{end_time_m:02d}:00"
                    
                    # Håndter vagter der går over midnat
                    if end_time_h < start_time_h:
                        # Beregn næste dag
                        next_day = (datetime.fromisoformat(dato) + timedelta(days=1)).strftime("%Y-%m-%d")
                        end_iso = f"{next_day}T{end_time_h:02d}:{end_time_m:02d}:00"
                    
                    # Byg beskrivelse
                    description_parts = []
                    if dag.get("normtid"):
                        description_parts.append(f"Normtid: {dag['normtid']}")
                    
                    if dag.get("tillæg"):
                        if isinstance(dag["tillæg"], list):
                            for tillæg in dag["tillæg"]:
                                if isinstance(tillæg, str):
                                    description_parts.append(tillæg)
                                elif isinstance(tillæg, dict) and tillæg.get("type"):
                                    description_parts.append(tillæg["type"])
                        elif isinstance(dag["tillæg"], str):
                            description_parts.append(dag["tillæg"])
                    
                    if dag.get("fravær"):
                        description_parts.append(f"Fravær: {dag['fravær']}")
                    
                    description = " | ".join(description_parts)
                    
                    ics_entry = {
                        "start": start_iso,
                        "end": end_iso,
                        "summary": f"Arbejde",
                        "description": description
                    }
                    
                    ics_entries.append(ics_entry)
            
            except Exception as e:
                logger.error(f"Fejl ved konvertering til ICS-format: {e}")
                continue
        
        return ics_entries