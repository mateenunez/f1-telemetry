interface QualifyingParts {
  Utc: string
  QualifyingPart: number
}

export interface ProcessedSession {
  session_name: string
  session_type: string
  location: string
  country_name: string
  circuit_short_name: string
  year: number
  date_start: string
  date_end: string
  gmt_offset: string
  current_lap: number
  total_laps: number
  track_status: string
  circuit_key: number
  session_status: string
  path: string
  series: QualifyingParts[]
}

export class SessionProcessor {
  private sessionInfo: ProcessedSession

  constructor() {
    // Initialize with default values
    this.sessionInfo = {
      session_name: "",
      session_type: "",
      location: "",
      country_name: "",
      circuit_short_name: "",
      year: new Date().getFullYear(),
      date_start: "",
      date_end: "",
      gmt_offset: "",
      current_lap: 0,
      total_laps: 0,
      track_status: "",
      circuit_key: 0,
      session_status: "",
      path: "",
      series: [] as QualifyingParts[]
    }
  }

  processSessionInfo(sessionData: any): ProcessedSession | null {
    if (!sessionData) {
      return null
    }

    const meeting = sessionData.Meeting || {}
    
    const existing = this.sessionInfo

    let series = existing.series;

    if (Array.isArray(sessionData.Series)) {
      series = sessionData.Series;
    } else {
      series.push(sessionData.Series)
    }

    const processed: ProcessedSession = {
      session_name: sessionData.Name ?? existing.session_name,
      session_type: sessionData.Type ?? existing.session_type,
      location: meeting.Location ?? existing.location,
      country_name: meeting.Country?.Name ?? existing.country_name,
      circuit_short_name: meeting.Circuit?.ShortName ?? existing.circuit_short_name,
      year: sessionData.StartDate ? new Date(sessionData.StartDate).getFullYear() : existing.year,
      date_start: sessionData.StartDate ?? existing.date_start,
      date_end: sessionData.EndDate ?? existing.date_end,
      gmt_offset: sessionData.GmtOffset ?? existing.gmt_offset,
      current_lap: existing.current_lap,
      total_laps: existing.total_laps,
      track_status: existing.track_status,
      circuit_key: meeting.Circuit?.Key ?? existing.circuit_key,
      session_status: sessionData.SessionStatus ?? existing.session_status,
      path: sessionData.Path ?? existing.path,
      series
    }

    this.sessionInfo = processed
    return processed
  }

  processLapCount(lapCountData: any): void {
    if (!lapCountData) return

    const existing = this.sessionInfo

    this.sessionInfo = {
      ...existing,
      current_lap: lapCountData.CurrentLap ?? existing.current_lap,
      total_laps: lapCountData.TotalLaps ?? existing.total_laps,
    }
  }

  processTrackStatus(trackStatusData: any): void {
    if (!trackStatusData) return

    const existing = this.sessionInfo;
    
    const processed = {
      ...existing,
      track_status: trackStatusData.Message ?? existing.track_status,
    }

    this.sessionInfo = processed;
  }

  getSessionInfo(): ProcessedSession {
    return this.sessionInfo
  }
}