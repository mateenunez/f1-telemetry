export interface ProcessedPitStop {
  driver_number: number
  pit_stop_time: number
  pit_lane_time: number
  lap: number
  date: string
}

export interface ProcessedStint {
  driver_number: number
  compound: string
  is_new: boolean
  total_laps: number
  start_laps: number
  lap_flags: number
  lap_time: string
  lap_number: number
}

export class PitProcessor {
  private pitStops: Map<number, ProcessedPitStop[]> = new Map()
  private stints: Map<number, ProcessedStint[]> = new Map()

  processPitStopSeries(pitStopData: any): ProcessedPitStop[] {
    if (!pitStopData || !pitStopData.PitTimes) {
      return []
    }

    const allPitStops: ProcessedPitStop[] = []

    Object.entries(pitStopData.PitTimes).forEach(([driverNumber, stops]: [string, any]) => {
      const driverStops: ProcessedPitStop[] = []

      stops.forEach((stop: any) => {
        const processed: ProcessedPitStop = {
          driver_number: Number.parseInt(driverNumber),
          pit_stop_time: Number.parseFloat(stop.PitStop.PitStopTime) || 0,
          pit_lane_time: Number.parseFloat(stop.PitStop.PitLaneTime) || 0,
          lap: Number.parseInt(stop.PitStop.Lap) || 0,
          date: stop.Timestamp || new Date().toISOString(),
        }

        driverStops.push(processed)
        allPitStops.push(processed)
      })

      this.pitStops.set(Number.parseInt(driverNumber), driverStops)
    })

    return allPitStops
  }

  processTyreStintSeries(stintData: any): ProcessedStint[] {
    if (!stintData || !stintData.Stints) {
      return []
    }

    const allStints: ProcessedStint[] = []

    Object.entries(stintData.Stints).forEach(([driverNumber, stints]: [string, any]) => {
      const driverStints: ProcessedStint[] = []

      stints.forEach((stint: any) => {
        const processed: ProcessedStint = {
          driver_number: Number.parseInt(driverNumber),
          compound: stint.Compound || "UNKNOWN",
          is_new: stint.New === "true",
          total_laps: Number.parseInt(stint.TotalLaps) || 0,
          start_laps: Number.parseInt(stint.StartLaps) || 0,
          lap_flags: Number.parseInt(stint.LapFlags) || 0,
          lap_time: stint.LapTime || "",
          lap_number: Number.parseInt(stint.LapNumber) || 0,
        }

        driverStints.push(processed)
        allStints.push(processed)
      })

      this.stints.set(Number.parseInt(driverNumber), driverStints)
    })

    return allStints
  }

  // Nuevo método para procesar TimingAppData
  processTimingAppData(timingAppData: any): ProcessedStint[] {
    if (!timingAppData || !timingAppData.Lines) {
      return []
    }

    const allStints: ProcessedStint[] = []

    Object.entries(timingAppData.Lines).forEach(([driverNumber, data]: [string, any]) => {
      if (data.Stints && Array.isArray(data.Stints)) {
        const driverStints: ProcessedStint[] = []

        data.Stints.forEach((stint: any) => {
          const processed: ProcessedStint = {
            driver_number: Number.parseInt(data.RacingNumber),
            compound: stint.Compound || "UNKNOWN",
            is_new: stint.New === "true",
            total_laps: Number.parseInt(stint.TotalLaps) || 0,
            start_laps: Number.parseInt(stint.StartLaps) || 0,
            lap_flags: Number.parseInt(stint.LapFlags) || 0,
            lap_time: stint.LapTime || "",
            lap_number: Number.parseInt(stint.LapNumber) || 0,
          }

          driverStints.push(processed)
          allStints.push(processed)
        })

        this.stints.set(Number.parseInt(data.RacingNumber), driverStints)
      }
    })

    return allStints
  }

  getDriverPitStops(driverNumber: number): ProcessedPitStop[] {
    return this.pitStops.get(driverNumber) || []
  }

  getDriverStints(driverNumber: number): ProcessedStint[] {
    return this.stints.get(driverNumber) || []
  }

  getCurrentStint(driverNumber: number): ProcessedStint | undefined {
    const stints = this.getDriverStints(driverNumber)
    return stints[stints.length - 1]
  }
}
