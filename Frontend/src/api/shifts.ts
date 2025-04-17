import { ShiftEvent } from '../types/shifts';

// Henter API basis URL fra miljøvariabel
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Henter vagter for en specifik bruger fra API'et
 * @param userId - Bruger-ID for den ønskede bruger
 * @returns Et array af vagter med titel, start- og sluttidspunkt
 */
export async function fetchShifts(userId: string): Promise<ShiftEvent[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/users/${userId}/shifts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch shifts: ${response.status} ${response.statusText}`);
    }

    // Modtager vagter fra API'et
    const shifts: ShiftEvent[] = await response.json();
    
    // Sikrer at datoer er i korrekt format (ISO string)
    return shifts.map(shift => ({
      ...shift,
      // Konverterer til Date-objekt og tilbage til ISO string hvis det ikke allerede er det
      start: typeof shift.start === 'string' ? shift.start : new Date(shift.start).toISOString(),
      end: typeof shift.end === 'string' ? shift.end : new Date(shift.end).toISOString()
    }));
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
} 