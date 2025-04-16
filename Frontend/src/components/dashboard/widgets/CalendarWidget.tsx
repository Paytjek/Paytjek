import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format } from "date-fns";
import { parse } from "date-fns";
import { startOfWeek } from "date-fns";
import { getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { da } from "date-fns/locale";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CalendarDays, CalendarRange } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

// Tilpasset styling for en meget kompakt kalender
const calendarStyles = {
  '.rbc-calendar': {
    fontSize: '0.75rem',
  },
  '.rbc-header': {
    padding: '2px',
    height: '24px',
  },
  '.rbc-toolbar': {
    marginBottom: '4px',
    display: 'none', // Skjul standard toolbar da vi bruger vores egen
  },
  '.rbc-toolbar button': {
    padding: '4px 6px',
  },
  '.rbc-time-header': {
    height: 'auto',
  },
  '.rbc-time-content': {
    height: 'auto',
  },
  '.rbc-time-slot': {
    minHeight: '20px',
  },
  '.rbc-event': {
    padding: '1px 3px',
    fontSize: '0.75rem',
  },
  '.rbc-time-view': {
    borderRadius: '8px',
  },
  '.rbc-time-header-content': {
    height: '24px',
  },
  '.rbc-month-view': {
    height: '250px',
  },
  '.rbc-month-row': {
    minHeight: '35px',
  },
  '.rbc-date-cell': {
    padding: '1px',
  },
  '.rbc-row-content': {
    height: '100%',
  }
};

const CalendarWidget: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [view, setView] = useState<"month" | "week">("month");

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

  // Beregn kommende vagter for preview
  const upcomingShifts = events
    .filter(event => event.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 3);

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="calendar" className="border-none">
        <AccordionTrigger className="hover:no-underline py-2">
          <div className="flex flex-col items-start">
            <div className="text-xl md:text-2xl font-bold">Vagtplan</div>
            <div className="text-sm text-muted-foreground mt-1">
              {upcomingShifts.length > 0 ? (
                `Næste vagt: ${upcomingShifts[0].title} - ${format(upcomingShifts[0].start, 'dd/MM')}`
              ) : (
                'Ingen kommende vagter'
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-2">
            <div className="flex justify-end">
              <ToggleGroup type="single" value={view} onValueChange={(v: "month" | "week" | null) => v && setView(v)}>
                <ToggleGroupItem value="month" aria-label="Månedsvisning" className="h-8 w-8">
                  <CalendarDays className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="week" aria-label="Ugevisning" className="h-8 w-8">
                  <CalendarRange className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className={view === "month" ? "h-[250px]" : "h-[300px]"}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView={view === "month" ? Views.MONTH : Views.WEEK}
                view={view === "month" ? Views.MONTH : Views.WEEK}
                date={currentDate}
                onNavigate={date => setCurrentDate(date)}
                selectable
                onSelectSlot={handleSelect}
                messages={messages}
                className="rounded-lg bg-background text-xs"
                style={{
                  height: "100%",
                  padding: "0.25rem",
                  ...calendarStyles,
                }}
                step={60}
                timeslots={1}
                min={new Date(0, 0, 0, 6, 0, 0)} // Start fra kl 6
                max={new Date(0, 0, 0, 18, 0, 0)} // Slut kl 18
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CalendarWidget; 