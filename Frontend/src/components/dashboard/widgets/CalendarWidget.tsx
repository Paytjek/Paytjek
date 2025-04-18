import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parseISO } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { da } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange, Download } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProfile } from "@/contexts/ProfileContext";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const locales = {
  "da": da
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface CalendarWidgetProps {
  isFullPage?: boolean;
}

const calendarStyles = {
  '.rbc-calendar': {
    fontSize: '0.9rem',
  },
  '.rbc-header': {
    padding: '5px',
    height: '35px',
    fontSize: '0.9rem',
  },
  '.rbc-toolbar': {
    marginBottom: '10px',
    display: 'none', // Vi bruger vores egen toolbar
  },
  '.rbc-time-header': {
    height: 'auto',
  },
  '.rbc-time-content': {
    height: 'auto',
  },
  '.rbc-time-slot': {
    minHeight: '40px',
  },
  '.rbc-event': {
    padding: '3px 5px',
    fontSize: '0.9rem',
  },
  '.rbc-time-view': {
    borderRadius: '8px',
  },
  '.rbc-month-view': {
    height: '100%',
  },
  '.rbc-month-row': {
    minHeight: '80px',
  },
  '.rbc-date-cell': {
    padding: '3px',
    fontSize: '0.9rem',
  },
  '.rbc-event-content': {
    fontSize: '0.9rem'
  }
};

const sidebarCalendarStyles = {
  ...calendarStyles,
  '.rbc-month-view': {
    height: '150px',
  }
};

const fullPageCalendarStyles = {
  '.rbc-calendar': {
    fontSize: '0.9rem',
  },
  '.rbc-header': {
    padding: '5px',
    height: '35px',
    fontSize: '0.9rem',
  },
  '.rbc-toolbar': {
    marginBottom: '10px',
    display: 'none', // Vi bruger vores egen toolbar
  },
  '.rbc-time-header': {
    height: 'auto',
  },
  '.rbc-time-content': {
    height: 'auto',
  },
  '.rbc-time-slot': {
    minHeight: '40px',
  },
  '.rbc-event': {
    padding: '3px 5px',
    fontSize: '0.9rem',
  },
  '.rbc-time-view': {
    borderRadius: '8px',
  },
  '.rbc-month-view': {
    height: '100%',
  },
  '.rbc-month-row': {
    minHeight: '80px',
  },
  '.rbc-date-cell': {
    padding: '3px',
    fontSize: '0.9rem',
  },
  '.rbc-event-content': {
    fontSize: '0.9rem'
  }
};

// Custom event-komponent til at vise både titel og tidsrum
const EventComponent = ({ event }: { event: ShiftEvent }) => {
  // Decode HTML entities og korriger special tegn
  const decodeTitle = (text: string) => {
    // Opret et midlertidigt element for at decode HTML entities
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;
    const decodedText = tempElement.textContent || tempElement.innerText;
    
    // Erstat eventuelle ugyldige tegn
    return decodedText
      .replace(/&aelig;/g, 'æ')
      .replace(/&oslash;/g, 'ø')
      .replace(/&aring;/g, 'å')
      .replace(/&AElig;/g, 'Æ')
      .replace(/&Oslash;/g, 'Ø')
      .replace(/&Aring;/g, 'Å');
  };

  return (
    <div>
      <div className="font-medium">{decodeTitle(event.title)}</div>
      <div className="text-xs opacity-80">
        {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
      </div>
    </div>
  );
};

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ isFullPage = true }) => {
  const { t } = useTranslation();
  const { selectedProfile } = useProfile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<"month" | "week">("month");
  const [rawData, setRawData] = useState<any[]>([]);  // For at gemme rå data til debugging
  const [selectedEvent, setSelectedEvent] = useState<ShiftEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Funktion til at decode HTML entities og korriger special tegn
  const decodeTitle = (text: string) => {
    // Opret et midlertidigt element for at decode HTML entities
    const tempElement = document.createElement('div');
    tempElement.innerHTML = text;
    const decodedText = tempElement.textContent || tempElement.innerText;
    
    // Erstat eventuelle ugyldige tegn
    return decodedText
      .replace(/&aelig;/g, 'æ')
      .replace(/&oslash;/g, 'ø')
      .replace(/&aring;/g, 'å')
      .replace(/&AElig;/g, 'Æ')
      .replace(/&Oslash;/g, 'Ø')
      .replace(/&Aring;/g, 'Å');
  };

  // Download calendar data as JSON file
  const downloadCalendarData = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(rawData, null, 2)], {type: "application/json"});
    element.href = URL.createObjectURL(file);
    element.download = "calendar_data.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Hent og parser ICS data fra backenden
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (selectedProfile?.user_id) {
        setLoading(true);
        try {
          // Hent kalenderdata fra backend API
          console.log("Henter kalenderdata for bruger:", selectedProfile.user_id);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users/${selectedProfile.user_id}/shifts`);
          
          if (!response.data) {
            throw new Error(`Fejl ved hentning af kalenderdata: Tom respons`);
          }
          
          // Gem rådata til debug
          setRawData(response.data);
          console.log("Rådata fra API:", response.data);
          
          // Konverter datostrenge til Date objekter
          const parsedEvents = response.data.map((event: any, index: number) => {
            console.log(`Parsing event ${index + 1}:`, event);
            try {
              // Brug parseISO for sikker dato-parsing
              const startDate = event.start ? parseISO(event.start) : new Date();
              const endDate = event.end ? parseISO(event.end) : new Date();
              
              // Valider at dato-parsing gik godt
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error("Ugyldig dato for event:", event);
                return null;
              }
              
              const validEvent = {
                ...event,
                start: startDate,
                end: endDate
              };
              
              console.log("Parsed event success:", validEvent);
              return validEvent;
            } catch (parseError) {
              console.error("Fejl ved parsing af event:", event, parseError);
              // Returner null for events der ikke kan parses
              return null;
            }
          }).filter(Boolean); // Filter null events ud
          
          console.log("Parsed events:", parsedEvents.length);
          setEvents(parsedEvents);
        } catch (error) {
          console.error('Fejl ved indlæsning af kalenderdata:', error);
          // Sæt tomme events i tilfælde af fejl
          setEvents([]);
        } finally {
          setLoading(false);
        }
      } else {
        // Hvis der ikke er nogen bruger_id, brug tomme events
        setEvents([]);
        setLoading(false);
      }
    };
    
    fetchCalendarData();
  }, [selectedProfile?.user_id]);

  // Tilpas kalender beskeder til dansk
  const messages = useMemo(() => ({
    week: 'Uge',
    work_week: 'Arbejdsuge',
    day: 'Dag',
    month: 'Måned',
    previous: 'Forrige',
    next: 'Næste',
    today: 'I dag',
    agenda: 'Agenda',
    showMore: (total: number) => `+${total} mere`,
    noEventsInRange: 'Ingen vagter i denne periode'
  }), []);

  // Håndter tilføjelse af ny vagt (vil blive udvidet senere)
  const handleSelect = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt('Indtast vagtens navn:');
    if (title) {
      setEvents([
        ...events,
        {
          id: String(events.length + 1),
          title,
          start,
          end,
        },
      ]);
    }
  };

  // Håndter klik på en begivenhed
  const handleEventClick = (event: ShiftEvent) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button 
            onClick={() => setCurrentDate(new Date())} 
            className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            I dag
          </button>
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              view === "month" 
                ? newDate.setMonth(currentDate.getMonth() - 1)
                : newDate.setDate(currentDate.getDate() - 7);
              setCurrentDate(newDate);
            }}
            className="px-3 py-1 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Forrige
          </button>
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              view === "month" 
                ? newDate.setMonth(currentDate.getMonth() + 1)
                : newDate.setDate(currentDate.getDate() + 7);
              setCurrentDate(newDate);
            }}
            className="px-3 py-1 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Næste
          </button>
          
          {/* Debug knap til at downloade rå kalenderdata */}
          <button 
            onClick={downloadCalendarData} 
            className="px-3 py-1 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
            title="Download rådata"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
        
        <ToggleGroup type="single" value={view} onValueChange={(v: "month" | "week" | null) => v && setView(v)}>
          <ToggleGroupItem value="month" aria-label="Månedsvisning">
            <CalendarDays className="h-4 w-4 mr-1" />
            Måned
          </ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="Ugevisning">
            <CalendarRange className="h-4 w-4 mr-1" />
            Uge
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="h-full">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView={view === "month" ? Views.MONTH : Views.WEEK}
            view={view === "month" ? Views.MONTH : Views.WEEK}
            date={currentDate}
            onNavigate={date => setCurrentDate(date)}
            onSelectSlot={handleSelect}
            onSelectEvent={handleEventClick}
            selectable
            messages={messages}
            formats={{
              dateFormat: 'dd',
              dayFormat: 'EEE dd/MM',
              monthHeaderFormat: 'MMMM yyyy',
              dayHeaderFormat: 'EEEE dd MMMM',
              dayRangeHeaderFormat: ({ start, end }) => 
                `${format(start, 'dd MMM')} - ${format(end, 'dd MMM')}`,
              eventTimeRangeFormat: ({ start, end }) => 
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            }}
            components={{
              event: EventComponent
            }}
            popup
            style={{ height: 600, ...calendarStyles }}
            onView={(newView) => {
              if (newView === 'month') setView('month');
              if (newView === 'week') setView('week');
            }}
          />
        )}
      </div>

      {/* Dialog til at vise detaljer om en begivenhed */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{decodeTitle(selectedEvent.title)}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Dato:</span>
                    <span className="text-sm">{format(new Date(selectedEvent.start.getFullYear(), selectedEvent.start.getMonth(), selectedEvent.start.getDate()), 'EEEE d. MMMM yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tidspunkt:</span>
                    <span className="text-sm">{format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end, 'HH:mm')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Varighed:</span>
                    <span className="text-sm">
                      {Math.round(
                        (selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60 * 60)
                      )} timer
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">Luk</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarWidget; 