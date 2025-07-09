export interface ProcessedTiming {
  driver_number: number
  gap_to_leader: string
  interval_to_ahead: string
  last_lap_time: string
  best_lap_time: string
  sector_times: {
    sector1: {Value: number, OverallFastest: boolean, PersonalFastest: boolean}
    sector2: {Value: number, OverallFastest: boolean, PersonalFastest: boolean}
    sector3: {Value: number, OverallFastest: boolean, PersonalFastest: boolean}
  }
  sector_segments: {
    sector1: number[]
    sector2: number[]
    sector3: number[]
  }
  speeds: {
    i1: string
    i2: string
    fl: string
    st: string
  }
  number_of_laps: number
  number_of_pit_stops: number
  retired: boolean
  in_pit: boolean
  date: string
}



export class TimingProcessor {
  private latestTiming: Map<number, ProcessedTiming> = new Map()

  processTimingData(timingData: any): ProcessedTiming[] {
    if (!timingData || !timingData.Lines) {
      return []
    }

    const processedTiming: ProcessedTiming[] = []

    Object.entries(timingData.Lines).forEach(([driverNumber, data]: [string, any]) => {
      const processed: ProcessedTiming = {
        driver_number: Number.parseInt(driverNumber),
        gap_to_leader: data.GapToLeader || "",
        interval_to_ahead: data.IntervalToPositionAhead?.Value || "",
        last_lap_time: data.LastLapTime?.Value || "",
        best_lap_time: data.BestLapTime?.Value || "",
        sector_times: {
          sector1: data.Sectors?.[0] || "",
          sector2: data.Sectors?.[1] || "",
          sector3: data.Sectors?.[2] || "",
        },
        sector_segments: {
          sector1: data.Sectors?.[0]?.Segments?.map((s: any) => s.Status) || [],
          sector2: data.Sectors?.[1]?.Segments?.map((s: any) => s.Status) || [],
          sector3: data.Sectors?.[2]?.Segments?.map((s: any) => s.Status) || [],
        },
        
        speeds: {
          i1: data.Speeds?.I1?.Value || "",
          i2: data.Speeds?.I2?.Value || "",
          fl: data.Speeds?.FL?.Value || "",
          st: data.Speeds?.ST?.Value || "",
        },
        number_of_laps: data.NumberOfLaps || 0,
        number_of_pit_stops: data.NumberOfPitStops || 0,
        retired: data.Retired || false,
        in_pit: data.InPit || false,
        date: new Date().toISOString(),
      }

      this.latestTiming.set(processed.driver_number, processed)
      processedTiming.push(processed)
    })

    return processedTiming
  }

  getDriverTiming(driverNumber: number): ProcessedTiming | undefined {
    return this.latestTiming.get(driverNumber)
  }

  getAllTiming(): ProcessedTiming[] {
    return Array.from(this.latestTiming.values())
  }
}
