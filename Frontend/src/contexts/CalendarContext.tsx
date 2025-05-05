import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { useProfile } from './ProfileContext';
import axios from 'axios';
import { parseISO } from 'date-fns';

export interface ShiftEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
}

interface CalendarContextType {
  events: ShiftEvent[];
  loading: boolean;
  refetchEvents: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const { selectedProfile } = useProfile();
  const [events, setEvents] = useState<ShiftEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const lastFetchRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const initialLoadDoneRef = useRef(false);

  const fetchEvents = useCallback(async (force = false) => {
    // Hvis der ikke er en profil, nulstil events
    if (!selectedProfile?.user_id) {
      setEvents([]);
      return;
    }

    // Hvis vi allerede er i gang med at hente data, skip dette kald
    if (fetchingRef.current) {
      return;
    }

    // Tjek cache - kun hvis vi har lavet initial load og ikke er tvunget opdatering
    if (!force && initialLoadDoneRef.current && lastFetchRef.current && Date.now() - lastFetchRef.current < 5 * 60 * 1000) {
      return; // Brug cached data
    }

    try {
      fetchingRef.current = true;
      // Kun vis loading state ved første indlæsning
      if (!initialLoadDoneRef.current) {
        setLoading(true);
      }

      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/${selectedProfile.user_id}/shifts`;
      const response = await axios.get(apiUrl);

      if (response.data) {
        const parsedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: parseISO(event.start),
          end: parseISO(event.end),
          allDay: event.allDay
        }));
        setEvents(parsedEvents);
        lastFetchRef.current = Date.now();
        initialLoadDoneRef.current = true;
      }
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      if (!initialLoadDoneRef.current) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [selectedProfile?.user_id]);

  // Kør initial fetch når profilen ændres
  useEffect(() => {
    initialLoadDoneRef.current = false; // Nulstil ved profilskift
    fetchEvents(true); // Force fetch ved profilskift
  }, [fetchEvents]);

  // Sæt interval for periodisk opdatering
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchEvents();
    }, 5 * 60 * 1000); // Opdater hver 5. minut

    return () => {
      clearInterval(intervalId);
      fetchingRef.current = false;
    };
  }, [fetchEvents]);

  const value = useMemo(() => ({
    events,
    loading,
    refetchEvents: () => fetchEvents(true) // Tillad force refresh via refetchEvents
  }), [events, loading, fetchEvents]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}; 