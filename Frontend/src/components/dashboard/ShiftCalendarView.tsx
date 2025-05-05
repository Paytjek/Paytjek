import React, { useEffect, useState } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { parseISO, format, startOfWeek, startOfMonth, addDays, addWeeks, addMonths, isSameDay, isToday, eachDayOfInterval, endOfMonth, endOfWeek } from "date-fns";
import { da } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditShiftModal } from "./EditShiftModal";
import { useToast } from "@/components/ui/use-toast";

interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

const daysOfWeek = [
  "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"
];

const ShiftCalendarView: React.FC = () => {
  const { selectedProfile } = useProfile();
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<ShiftEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { toast } = useToast();

  const currentViewStart = viewMode === 'week' 
    ? startOfWeek(currentDate, { weekStartsOn: 1 })
    : startOfMonth(currentDate);

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (selectedProfile?.user_id) {
        setLoading(true);
        try {
          const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/${selectedProfile.user_id}/shifts`;
          const response = await fetch(apiUrl);
          const data = await response.json();
          const parsedEvents = data.map((event: any) => ({
            ...event,
            start: parseISO(event.start),
            end: parseISO(event.end)
          }));
          setEvents(parsedEvents);
        } catch (error) {
          console.error('Error fetching shifts:', error);
          setEvents([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [selectedProfile?.user_id]);

  const handlePrevious = () => {
    setCurrentDate(prev => 
      viewMode === 'week' ? addWeeks(prev, -1) : addMonths(prev, -1)
    );
  };

  const handleNext = () => {
    setCurrentDate(prev => 
      viewMode === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleShiftClick = (event: ShiftEvent) => {
    setSelectedShift(event);
    setIsEditModalOpen(true);
  };

  const handleSaveShift = async (updatedShift: ShiftEvent) => {
    if (!selectedProfile?.user_id) return;

    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/${selectedProfile.user_id}/shifts/${updatedShift.id}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedShift.title,
          start: updatedShift.start.toISOString(),
          end: updatedShift.end.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update shift');
      }

      setEvents(events.map(event => 
        event.id === updatedShift.id ? updatedShift : event
      ));

      toast({
        title: "Vagt opdateret",
        description: "Dine ændringer er blevet gemt.",
      });
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Fejl",
        description: "Der skete en fejl under opdatering af vagten.",
        variant: "destructive",
      });
    }
  };

  const getDaysToDisplay = () => {
    if (viewMode === 'week') {
      return Array.from({ length: 7 }, (_, i) => addDays(currentViewStart, i));
    } else {
      const start = startOfWeek(startOfMonth(currentViewStart), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentViewStart), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  };

  const days = getDaysToDisplay();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium">
              {format(currentViewStart, 'MMMM yyyy', { locale: da })}
            </h2>
            <div className="text-sm text-muted-foreground">
              {viewMode === 'week' && `Uge ${format(currentViewStart, 'w', { locale: da })}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="text-xs"
              >
                Uge
              </Button>
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="text-xs"
              >
                Måned
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              I dag
            </Button>
            <div className="flex items-center rounded-md border">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-blue-50 rounded-l-md border-r text-blue-600"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-blue-50 rounded-r-md text-blue-600"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Tryk på en vagt for at indberette ændringer i din vagt
        </p>
      </div>

      <div className={cn(
        "grid border rounded-lg overflow-hidden bg-background",
        viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'
      )}>
        {/* Weekday Headers */}
        {daysOfWeek.map((day, idx) => (
          <div
            key={day}
            className="py-1 text-center border-b"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {day.slice(0, 3)}
            </div>
          </div>
        ))}

        {/* Calendar Cells */}
        {days.map((date, idx) => {
          const isCurrentDay = isToday(date);
          const isCurrentMonth = viewMode === 'week' || date.getMonth() === currentViewStart.getMonth();
          const dayEvents = events.filter(ev => isSameDay(ev.start, date));
          
          return (
            <div
              key={date.toISOString()}
              className={cn(
                "min-h-[100px] p-1.5 border-b border-r relative",
                isCurrentDay && "bg-blue-50/30",
                !isCurrentMonth && "bg-muted/5",
                viewMode === 'month' && "min-h-[120px]"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                !isCurrentMonth && "text-muted-foreground",
                isCurrentDay && "text-blue-600"
              )}>
                {format(date, 'd')}
              </div>
              
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                </div>
              ) : !selectedProfile?.user_id ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  Vælg profil
                </div>
              ) : dayEvents.length === 0 ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30 text-sm">
                  +
                </div>
              ) : (
                <div className="space-y-1">
                  {dayEvents.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => handleShiftClick(ev)}
                      style={{
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        borderLeft: '3px solid #2563eb'
                      }}
                      className="rounded-sm px-2 py-1 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="text-xs font-medium text-blue-900 truncate">
                        {ev.title}
                      </div>
                      <div className="text-[11px] text-blue-600">
                        {format(ev.start, 'HH:mm')} - {format(ev.end, 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <EditShiftModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        shift={selectedShift}
        onSave={handleSaveShift}
      />
    </div>
  );
};

export default ShiftCalendarView; 