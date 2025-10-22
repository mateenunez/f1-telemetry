export type TrackStatusKey = 'AllClear' | 'Yellow' | 'Red' | 'Aborted' | 'SCDeployed';

export const TRACK_STATUS_LABELS_EN: Record<TrackStatusKey, string> = {
    AllClear: 'Clear',
    Yellow: 'Yellow Flag',
    Red: 'Red Flag',
    Aborted: 'Aborted',
    SCDeployed: 'Safety Car',
};

export const TRACK_STATUS_LABELS_ES: Record<TrackStatusKey, string> = {
    AllClear: 'Despejado',
    Yellow: 'Alerta Amarilla',
    Red: 'Alerta Roja',
    Aborted: 'Suspendido',
    SCDeployed: 'Coche de Seguridad',
};

export const TRACK_STATUS_COLORS: Record<TrackStatusKey, string> = {
    AllClear: '#F3F3F3a1',   // offWhite
    Yellow: '#eab309',     // yellow-500
    Red: '#ef4444',        // red-500
    Aborted: '#F3F3F366',    // gray-500
    SCDeployed: '#f59e0b', // amber-500
};

function normalizeStatus(status: string): TrackStatusKey | null {
    if (!status) return null;
    const key = status.replace(/\s+/g, '').trim() as TrackStatusKey;
    const allowed: TrackStatusKey[] = ['AllClear', 'Yellow', 'Red', 'Aborted', 'SCDeployed'];
    return allowed.includes(key) ? key : null;
}

export function getTrackStatusLabel(status: string, translate: boolean): string {
    const key = normalizeStatus(status);
    if (!key) return status || '';
    return translate ? TRACK_STATUS_LABELS_ES[key] : TRACK_STATUS_LABELS_EN[key];
}

export function getTrackStatusColor(status: string): string {
    const key = normalizeStatus(status);
    if (!key) return '#6b7280'; // fallback gray
    return TRACK_STATUS_COLORS[key];
}