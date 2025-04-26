import aiohttp
import icalendar
from datetime import datetime
import logging
import ssl
import sys

async def fetch_ics(url):
    """Henter ICS-kalender fra URL"""
    print(f"DEBUG: Starter hentning af ICS fra URL: {url}", file=sys.stderr)
    try:
        # Opret en SSL-kontekst, der ikke verificerer certifikater
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        print(f"DEBUG: SSL kontekst oprettet med verify_mode: {ssl_context.verify_mode}", file=sys.stderr)
        
        async with aiohttp.ClientSession() as session:
            logging.info(f"Henter ICS-data fra URL: {url}")
            print(f"DEBUG: aiohttp session oprettet, forsøger at hente data...", file=sys.stderr)
            try:
                print(f"DEBUG: Sender GET anmodning til {url}", file=sys.stderr)
                async with session.get(url, ssl=ssl_context, timeout=30) as response:
                    status = response.status
                    print(f"DEBUG: Modtog HTTP status {status} fra server", file=sys.stderr)
                    
                    if status == 200:
                        text = await response.text()
                        print(f"DEBUG: Succes! Modtog {len(text)} bytes data", file=sys.stderr)
                        if len(text) < 100:
                            print(f"DEBUG: Kort respons: {text}", file=sys.stderr)
                        else:
                            print(f"DEBUG: Begyndelsen af respons: {text[:100]}...", file=sys.stderr)
                        
                        logging.info(f"Succes! Modtog {len(text)} bytes data fra ICS URL")
                        return text
                    else:
                        error_text = await response.text()
                        print(f"DEBUG: HTTP fejl {status}. Respons: {error_text[:200]}", file=sys.stderr)
                        logging.error(f"HTTP fejl {status} ved hentning fra {url}")
                        return None
            except aiohttp.ClientError as e:
                print(f"DEBUG: aiohttp ClientError: {e}", file=sys.stderr)
                logging.error(f"aiohttp fejl ved forbindelse til {url}: {e}")
                return None
    except Exception as e:
        print(f"DEBUG: Generel fejl ved hentning af ICS-data: {e}", file=sys.stderr)
        logging.error(f"Generel fejl ved hentning af ICS-data: {e}")
        return None

async def ical_to_shifts(ical_data):
    """Konverterer iCalendar data til en liste af vagter"""
    if not ical_data:
        logging.warning("Ingen ICS-data at konvertere")
        print("DEBUG: Ingen ICS-data at konvertere", file=sys.stderr)
        return []
    
    try:
        print(f"DEBUG: Forsøger at parse iCalendar data ({len(ical_data)} bytes)", file=sys.stderr)
        calendar = icalendar.Calendar.from_ical(ical_data)
        shifts = []
        
        event_count = 0
        for component in calendar.walk():
            if component.name == "VEVENT":
                event_count += 1
                try:
                    start = component.get('dtstart').dt
                    end = component.get('dtend').dt
                    
                    if isinstance(start, datetime) and isinstance(end, datetime):
                        shift = {
                            "id": str(component.get('uid')),
                            "title": str(component.get('summary', 'Vagt')),
                            "start": start.isoformat(),
                            "end": end.isoformat()
                        }
                        shifts.append(shift)
                        if len(shifts) <= 3:
                            print(f"DEBUG: Parsede event {len(shifts)}: {shift['title']} {shift['start']}", file=sys.stderr)
                except Exception as e:
                    logging.error(f"Fejl ved behandling af kalenderbegivenhed: {e}")
                    print(f"DEBUG: Fejl ved parsing af event: {e}", file=sys.stderr)
        
        print(f"DEBUG: Fandt {event_count} events, konverterede {len(shifts)} vagter", file=sys.stderr)
        logging.info(f"Konverteret {len(shifts)} vagter fra ICS-data")
        return shifts
    except Exception as e:
        logging.error(f"Fejl ved parsing af ICS-data: {e}")
        print(f"DEBUG: Fejl ved parsing af ICS-data: {e}", file=sys.stderr)
        return [] 