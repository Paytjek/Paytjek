/**
 * Repræsenterer en vagt-begivenhed
 */
export interface ShiftEvent {
  id: string;      // Unik identifikator for vagten
  title: string;   // Titel eller beskrivelse af vagten
  start: string;   // ISO 8601 dato-tidspunkt for vagtens start
  end: string;     // ISO 8601 dato-tidspunkt for vagtens slut
  allDay?: boolean; // Valgfri flag der indikerer om det er en heldags-vagt
} 