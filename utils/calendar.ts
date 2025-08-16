export interface F1Event {
    id: string;
    summary: string;
    start: string;
    end: string;
    location: string;
    status: string;
}

export interface TimeUntilNext {
    days: number;
    hours: number;
    minutes: number;
    totalMinutes: number;
    totalHours: number;
}

export interface F1CalendarResponse {
    success: boolean;
    nextEvent: F1Event;
    timeUntilNext: TimeUntilNext;
    totalEvents: number;
    upcomingEvents: F1Event[];
    lastUpdated: string;
}

export async function fetchCalendar(): Promise<F1CalendarResponse> {
    try {
        
        const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL || "";
        const response = await fetch(calendarUrl);

        if (!response.ok) {
            throw new Error(`Error al obtener el calendario: ${response.status}`);
        }

        const data: F1CalendarResponse = await response.json();

        if (!data.success) {
            throw new Error('Error en la respuesta de la API');
        }

        return data;

    } catch (error) {
        console.error('Error al obtener el calendario:', error);
        throw error;
    }
}

export function getEventType(summary: string): 'Practice 1' | 'Practice 2' | 'Practice 3' | 'Qualifying' | 'Sprint' | 'Race' | 'Other' {
    const summaryLower = summary.toLowerCase();

    if (summaryLower.includes('practice 1')) {
        return 'Practice 1';
    } else if (summaryLower.includes('practice 2')) {
        return 'Practice 2';
    } else if (summaryLower.includes('practice 3')) {
        return 'Practice 3';
    } else if (summaryLower.includes('qualifying') || summaryLower.includes('⏱️')) {
        return 'Qualifying';
    } else if (summaryLower.includes('sprint')) {
        return 'Sprint';
    } else if (summaryLower.includes('race') || summaryLower.includes('🏁')) {
        return 'Race';
    }

    return 'Other';
}

export function formatTimeUntil(timeUntil: TimeUntilNext): string {
    if (timeUntil.days > 0) {
      return `${timeUntil.days} day${timeUntil.days > 1 ? 's' : ''} ${timeUntil.hours}h ${timeUntil.minutes}m`;
    } else if (timeUntil.hours > 0) {
      return `${timeUntil.hours}hs ${timeUntil.minutes}min`;
    } else {
      return `${timeUntil.minutes}minutes`;
    }
  }
