export interface F1Event {
    id: string;
    type: string;
    track: string;
    start: string;
    end?: string,
    location: string;
}

export interface TimeUntilNext {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMinutes: number;
    totalHours: number;
}

export interface GroupByLocation {
    track: string;
    location: string;
    p1?: F1Event;
    p2?: F1Event;
    p3?: F1Event;
    q?: F1Event;
    r?: F1Event;
    sq?: F1Event;
    sr?: F1Event;
    start: Date;
}

export interface F1CalendarResponse {
    success: boolean;
    nextEvent: F1Event;
    timeUntilNext: TimeUntilNext;
    totalEvents: number;
    groupsByLocation: GroupByLocation[];
    lastUpdated: string;
}

export interface F1UpcomingResponse {
    success: boolean;
    nextEvent: F1Event;
    timeUntilNext: TimeUntilNext;
    lastUpdated: string;
}

export async function fetchUpcoming(): Promise<F1UpcomingResponse> {
    try {

        const upcomingUrl = process.env.NEXT_PUBLIC_UPCOMING_URL || "";
        const response = await fetch(upcomingUrl);

        if (!response.ok) {
            throw new Error(`Error al obtener el evento siguiente: ${response.status}`);
        }

        const data: F1UpcomingResponse = await response.json();

        if (!data.success) {
            throw new Error('Error en la respuesta de la API');
        }

        return data;

    } catch (error) {
        console.error('Error al obtener el calendario:', error);
        throw error;
    }
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

export function formatTimeUntil(timeUntil: TimeUntilNext, translate: boolean = false): string {

    if (timeUntil.days > 0) {
        return `${timeUntil.days}${translate ? " día" : " day"}${timeUntil.days > 1 ? 's' : ''} ${timeUntil.hours}h ${timeUntil.minutes}m`;
    } else if (timeUntil.hours > 0) {
        return `${timeUntil.hours}hs ${timeUntil.minutes}min`;
    } else {
        return `${timeUntil.minutes}${translate ? "minutos " : "minutes "}`;
    }
}

export function extendedFormatTimeUntil(timeUntil: TimeUntilNext): string {
    if (timeUntil.days > 0) {
        return `${timeUntil.days} day${timeUntil.days > 1 ? 's' : ''} ${timeUntil.hours} hours ${timeUntil.minutes} minutes`;
    } else if (timeUntil.hours > 0) {
        return `${timeUntil.hours} hour ${timeUntil.minutes} minutes`;
    } else {
        return `${timeUntil.minutes}minutes`;
    }
}

export function formatEventDate(dateString: string): string {
    try {
        const date = new Date(dateString);

        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        // Opciones de formateo para la fecha
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        // Opciones de formateo para la hora
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };

        // Formatear fecha y hora por separado
        const formattedDate = date.toLocaleDateString('en-US', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

        return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

export function formatEventDateShort(dateString: string, locale: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        // Formato corto: "Aug 29, 2025"
        const dateOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };

        const formattedDate = date.toLocaleDateString(locale, dateOptions);
        const formattedTime = date.toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return `${formattedDate} - ${formattedTime}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

export function formatEventTime(dateString: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error formatting time:', error);
        return 'Invalid time';
    }
}

export function getRelativeDate(dateString: string): string {
    try {
        const date = new Date(dateString);
        const now = new Date();

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const diffTime = date.getDay() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (date.getDay().toString() == now.getDay().toString()) {
            return '(Today)';
        } else if (diffDays > 1) {
            return '(Tomorrow)';
        }
        else {
            return ``;
        }
    } catch (error) {
        console.error('Error getting relative date:', error);
        return 'Invalid date';
    }
}

export function getCountryCode(location: string): string {
    const locationLower = location.toLowerCase();

    const countryCodes: { [key: string]: string } = {
        'netherlands': 'NL',
        'holland': 'NL',
        'amsterdam': 'NL',
        'zandvoort': 'NL',

        'monaco': 'MC',
        'monte carlo': 'MC',

        'italy': 'IT',
        'monza': 'IT',
        'imola': 'IT',
        'mugello': 'IT',

        'spain': 'ES',
        'barcelona': 'ES',
        'madrid': 'ES',
        'valencia': 'ES',

        'france': 'FR',
        'paris': 'FR',
        'le castellet': 'FR',
        'paul ricard': 'FR',

        'austria': 'AT',
        'spielberg': 'AT',
        'red bull ring': 'AT',

        'hungary': 'HU',
        'budapest': 'HU',
        'hungaroring': 'HU',

        'belgium': 'BE',
        'spa': 'BE',
        'francorchamps': 'BE',

        'great britain': 'GB',
        'england': 'GB',
        'silverstone': 'GB',
        'brands hatch': 'GB',

        'germany': 'DE',
        'nürburgring': 'DE',
        'hockenheim': 'DE',
        'nürburg': 'DE',

        'portugal': 'PT',
        'portimão': 'PT',
        'algarve': 'PT',

        'russia': 'RU',
        'sochi': 'RU',

        'azerbaijan': 'AZ',
        'baku': 'AZ',

        'turkey': 'TR',
        'istanbul': 'TR',

        'australia': 'AU',
        'melbourne': 'AU',
        'adelaide': 'AU',

        'japan': 'JP',
        'suzuka': 'JP',
        'fuji': 'JP',

        'singapore': 'SG',
        'marina bay': 'SG',

        'united states': 'US',
        'usa': 'US',
        'austin': 'US',
        'miami': 'US',
        'las vegas': 'US',
        'indianapolis': 'US',
        'detroit': 'US',
        'phoenix': 'US',
        'dallas': 'US',

        'canada': 'CA',
        'montreal': 'CA',
        'toronto': 'CA',
        'vancouver': 'CA',

        'mexico': 'MX',
        'mexico city': 'MX',
        'guadalajara': 'MX',

        'brazil': 'BR',
        'são paulo': 'BR',
        'interlagos': 'BR',
        'rio de janeiro': 'BR',

        'argentina': 'AR',
        'buenos aires': 'AR',

        'qatar': 'QA',
        'losail': 'QA',
        'doha': 'QA',

        'abu dhabi': 'AE',
        'united arab emirates': 'AE',
        'uae': 'AE',
        'dubai': 'AE',

        'saudi arabia': 'SA',
        'jeddah': 'SA',
        'riyadh': 'SA',

        'china': 'CN',
        'shanghai': 'CN',
        'beijing': 'CN',

        'bahrain': 'BH',
        'sakhir': 'BH',
        'manama': 'BH',

        'malaysia': 'MY',
        'kuala lumpur': 'MY',
        'sepang': 'MY',

        'india': 'IN',
        'new delhi': 'IN',
        'buddh international': 'IN',

        'south korea': 'KR',
        'korea': 'KR',
        'yeongam': 'KR',
        'seoul': 'KR',

        'vietnam': 'VN',
        'hanoi': 'VN',

        'thailand': 'TH',
        'bangkok': 'TH',

        'indonesia': 'ID',
        'jakarta': 'ID',

        'philippines': 'PH',
        'manila': 'PH',

        'new zealand': 'NZ',
        'auckland': 'NZ',

        'south africa': 'ZA',
        'kyalami': 'ZA',
        'johannesburg': 'ZA'
    };

    for (const [key, code] of Object.entries(countryCodes)) {
        if (locationLower.includes(key) || key.includes(locationLower)) {
            return code;
        }
    }
    return 'UN';
}

export function getDayOfWeek(dateString: string, locale: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const dayName = date.toLocaleDateString(locale, {
            weekday: 'long'
        });

        const dayNumber = date.getDate();

        return `${dayName} ${dayNumber}`;
    } catch (error) {
        console.error('Error getting day of week:', error);
        return 'Invalid date';
    }
}

export function getTimeOnly(dateString: string): string {
    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return 'Invalid time';
        }

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (error) {
        console.error('Error getting time only:', error);
        return 'Invalid time';
    }
}

export function ensureUtc(s: string) {
    if (!s) return s;
    const hasTZ = /Z$|[+\-]\d\d:\d\d$/.test(s);
    return hasTZ ? s : `${s}Z`;
};

export function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export const toLocaleTime = (dateString: string) => {
    const date = new Date(ensureUtc(dateString));
    return date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Argentina/Buenos_Aires",
    });
};

export const parseTimeOffset = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
};

export const translateSessionType = (sessionType: string, dict: any): string => {
    if (!sessionType) {
        return '';
    }
    const translations: { [key: string]: string } = {
        'Sprint Race': dict.sessionTypes.sprintrace,
        'Sprint Qualification': dict.sessionTypes.sprintqualification,

        'Practice 1': dict.sessionTypes.practice1,
        'Practice 2': dict.sessionTypes.practice2,
        'Practice 3': dict.sessionTypes.practice3,
        'Qualifying': dict.sessionTypes.qualifying,
        'Race': dict.sessionTypes.race,
    };

    let translatedName = sessionType;

    for (const [englishTerm, spanishTerm] of Object.entries(translations)) {

        const regex = new RegExp(englishTerm, 'gi');

        translatedName = translatedName.replace(regex, spanishTerm);
    }

    return translatedName;
};

export const translateSessionName = (sessionType: string | undefined): string => {
    if (!sessionType) {
        return '';
    }
    const translations: { [key: string]: string } = {
        'Sprint Race': "Carrera Sprint",
        'Sprint Qualification': "Calificación Sprint",

        'Practice 1': "Práctica 1",
        'Practice 2': "Práctica 2",
        'Practice 3': "Práctica 3",
        'Qualifying': "Calificación",
        'Race': "Carrera",
    };

    let translatedName = sessionType;

    for (const [englishTerm, spanishTerm] of Object.entries(translations)) {

        const regex = new RegExp(englishTerm, 'gi');

        translatedName = translatedName.replace(regex, spanishTerm);
    }

    return translatedName;
};

export const translateSessionStatus = (status: string | undefined): string => {
    if (!status) {
        return '';
    }

    const translations: { [key: string]: string } = {
        Started: "Iniciada",
        Active: "Activa",
        Inactive: "Inactiva",
        Paused: "Pausada",
        Finalised: "Finalizada",
    };

    const translated = translations[status];

    return translated;
};