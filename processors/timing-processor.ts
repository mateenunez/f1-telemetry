export interface ProcessedTiming {
  driver_number: number
  gap_to_leader: string
  interval_to_ahead: string
  last_lap_time: string
  best_lap_time: string
  sector_times: {
    sector1: { Value: number, OverallFastest: boolean, PersonalFastest: boolean }
    sector2: { Value: number, OverallFastest: boolean, PersonalFastest: boolean }
    sector3: { Value: number, OverallFastest: boolean, PersonalFastest: boolean }
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
      const driverNum = Number.parseInt(driverNumber)

      // Obtener datos existentes o crear nuevos
      const existing = this.latestTiming.get(driverNum) || {
        driver_number: driverNum,
        gap_to_leader: "",
        interval_to_ahead: "",
        last_lap_time: "",
        best_lap_time: "",
        sector_times: { sector1: "", sector2: "", sector3: "" },
        sector_segments: { sector1: [], sector2: [], sector3: [] },
        speeds: { i1: "", i2: "", fl: "", st: "" },
        number_of_laps: 0,
        number_of_pit_stops: 0,
        retired: false,
        in_pit: false,
        date: new Date().toISOString(),
      }

      // Actualizar solo los campos que vienen en los datos
      const updated: ProcessedTiming = {
        ...existing,
        gap_to_leader: data.GapToLeader !== undefined ? data.GapToLeader : existing.gap_to_leader,
        interval_to_ahead:
          data.IntervalToPositionAhead?.Value !== undefined
            ? data.IntervalToPositionAhead.Value
            : existing.interval_to_ahead,
        last_lap_time: data.LastLapTime?.Value !== undefined ? data.LastLapTime.Value : existing.last_lap_time,
        best_lap_time: data.BestLapTime?.Value !== undefined ? data.BestLapTime.Value : existing.best_lap_time,
        sector_times: {
          sector1: Array.isArray(data.Sectors?.[0]?.Value) ? data.Sectors[0].Value : existing.sector_times.sector1,
          sector2: data.Sectors?.[1]?.Value !== undefined ? data.Sectors[1].Value : existing.sector_times.sector2,
          sector3: data.Sectors?.[2]?.Value !== undefined ? data.Sectors[2].Value : existing.sector_times.sector3,
        },
        sector_segments: {
          sector1: Array.isArray(data.Sectors?.[0]?.Segments)
            ? data.Sectors[0].Segments.map((s: any) => s.Status)
            : existing.sector_segments.sector1,
          sector2: Array.isArray(data.Sectors?.[1]?.Segments)
            ? data.Sectors[1].Segments.map((s: any) => s.Status)
            : existing.sector_segments.sector2,
          sector3: Array.isArray(data.Sectors?.[2]?.Segments)
            ? data.Sectors[2].Segments.map((s: any) => s.Status)
            : existing.sector_segments.sector3,

        },
        speeds: {
          i1: data.Speeds?.I1?.Value !== undefined ? data.Speeds.I1.Value : existing.speeds.i1,
          i2: data.Speeds?.I2?.Value !== undefined ? data.Speeds.I2.Value : existing.speeds.i2,
          fl: data.Speeds?.FL?.Value !== undefined ? data.Speeds.FL.Value : existing.speeds.fl,
          st: data.Speeds?.ST?.Value !== undefined ? data.Speeds.ST.Value : existing.speeds.st,
        },
        number_of_laps: data.NumberOfLaps !== undefined ? data.NumberOfLaps : existing.number_of_laps,
        number_of_pit_stops: data.NumberOfPitStops !== undefined ? data.NumberOfPitStops : existing.number_of_pit_stops,
        retired: data.Retired !== undefined ? data.Retired : existing.retired,
        in_pit: data.InPit !== undefined ? data.InPit : existing.in_pit,
        date: new Date().toISOString(),
      }

      this.latestTiming.set(driverNum, updated)
      processedTiming.push(updated)
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
