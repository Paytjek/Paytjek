import requests
from icalendar import Calendar
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import os
import html

class ICalService:
    """Service til at håndtere parsing af iCalendar-filer"""

    @staticmethod
    async def fetch_ical_data(url: str) -> Optional[str]:
        """Henter iCalendar-data fra en URL"""
        try:
            print(f"Forsøger at hente iCalendar-data fra: {url}")
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            # Sæt encoding til utf-8 for at sikre korrekt håndtering af danske tegn
            response.encoding = 'utf-8'
            print(f"Succesfuldt hentet iCalendar-data: {len(response.text)} bytes")
            return response.text
        except Exception as e:
            print(f"Fejl ved hentning af iCalendar-data: {e}")
            return None

    @staticmethod
    async def parse_ical_data(ical_text: str) -> List[Dict[str, Any]]:
        """Parser iCalendar-data og returnerer en liste af begivenheder"""
        events = []
        event_count = 0
        error_count = 0
        
        try:
            print(f"Starter parsing af iCalendar-data ({len(ical_text)} bytes)")
            cal = Calendar.from_ical(ical_text)
            
            print(f"Fandt kalender-objekt, leder efter VEVENT-elementer")
            for component in cal.walk('VEVENT'):
                event_count += 1
                try:
                    # Debug info for hver event
                    raw_summary = component.get('summary', 'Ingen titel')
                    
                    # Sikre at summary er korrekt decodet og håndteret som UTF-8
                    if isinstance(raw_summary, bytes):
                        summary = raw_summary.decode('utf-8')
                    else:
                        summary = str(raw_summary)
                    
                    # Decode eventuelle HTML entities i titlen
                    summary = html.unescape(summary)
                    
                    print(f"Parser event {event_count}: {summary}")
                    
                    start = component.get('dtstart').dt
                    print(f"  - Start: {start} (type: {type(start).__name__})")
                    
                    end = component.get('dtend').dt
                    print(f"  - End: {end} (type: {type(end).__name__})")
                    
                    # Hvis start eller sluttidspunkt er datetime-objekter (ikke dato), 
                    # skal vi sikre, at de er konverteret korrekt
                    if isinstance(start, datetime):
                        start_time = start
                    else:
                        # Hvis det er en dato, konverter til datetime
                        print(f"  - Konverterer start-dato til datetime")
                        start_time = datetime.combine(start, datetime.min.time())
                    
                    if isinstance(end, datetime):
                        end_time = end
                    else:
                        # Hvis det er en dato, konverter til datetime
                        print(f"  - Konverterer end-dato til datetime")
                        end_time = datetime.combine(end, datetime.min.time())
                    
                    # Forsøg at få uid'et
                    uid = component.get('uid', f'event-{event_count}')
                    if uid:
                        uid = str(uid)
                    else:
                        uid = f'event-{event_count}'
                    
                    # Opret begivenhed som dict
                    event = {
                        'id': uid,
                        'title': summary,
                        'start': start_time.isoformat(),
                        'end': end_time.isoformat(),
                        'allDay': not isinstance(start, datetime)  # True hvis det er en heldagsbegivenhed
                    }
                    
                    print(f"  - Oprettet event: {json.dumps(event, ensure_ascii=False)}")
                    events.append(event)
                except Exception as event_err:
                    error_count += 1
                    print(f"Fejl ved parsing af event {event_count}: {event_err}")
            
            # Sorter begivenheder efter starttidspunkt
            events.sort(key=lambda x: x['start'])
            
            print(f"Parsing færdig: {len(events)} events succesfuldt parset, {error_count} fejlede")
            
            # For debugging: Gem events til en fil så vi kan inspicere data
            debug_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'calendar_data_debug.json')
            with open(debug_file, 'w', encoding='utf-8') as f:
                json.dump(events, f, ensure_ascii=False, indent=2)
            print(f"Debug-data gemt til: {debug_file}")
            
            return events
        except Exception as e:
            print(f"Fejl ved parsing af iCalendar-data: {e}")
            return [] 