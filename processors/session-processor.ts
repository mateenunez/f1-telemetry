export interface ProcessedSession {
  session_name: string
  session_type: string
  location: string
  country_name: string
  circuit_short_name: string
  year: number
  date_start: string
  date_end: string
  current_lap: number
  total_laps: number
  track_status: string
  circuit_key:number
  session_status: string
}

export class SessionProcessor {
  private sessionInfo: ProcessedSession | null = null

  processSessionInfo(sessionData: any): ProcessedSession | null {
    if (!sessionData) {
      return null
    }

    const meeting = sessionData.Meeting || {}

    const processed: ProcessedSession = {
      session_name: sessionData.Name || "",
      session_type: sessionData.Type || "",
      location: meeting.Location || "",
      country_name: meeting.Country?.Name || "",
      circuit_short_name: meeting.Circuit?.ShortName || "",
      year: new Date(sessionData.StartDate).getFullYear() || new Date().getFullYear(),
      date_start: sessionData.StartDate || "",
      date_end: sessionData.EndDate || "",
      current_lap: 0,
      total_laps: 0,
      track_status: "Unknown",
      circuit_key: meeting.Circuit?.Key || "",
      session_status: sessionData.SessionStatus || "",
    }

    this.sessionInfo = processed
    return processed
  }

  processLapCount(lapCountData: any): void {
    if (lapCountData && this.sessionInfo) {
      this.sessionInfo.current_lap = lapCountData.CurrentLap || 0
      this.sessionInfo.total_laps = lapCountData.TotalLaps || 0
    }
  }

  processTrackStatus(trackStatusData: any): void {
    if (trackStatusData && this.sessionInfo) {
      this.sessionInfo.track_status = trackStatusData.Message || trackStatusData.Status || "Unknown"
    }
  }

  getSessionInfo(): ProcessedSession | null {
    return this.sessionInfo
  }
}
