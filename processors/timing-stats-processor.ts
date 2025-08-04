export interface ProcessedTimingStats {
  driver_number: number
  personal_best_lap_time: {
    Value?: string
    Lap?: number
    Position?: number
  }
  best_sectors: {
    Value?: string
    Position?: number
  }[]
  best_speeds: {
    i1?: { Value?: string; Position?: number }
    i2?: { Value?: string; Position?: number }
    fl?: { Value?: string; Position?: number }
    st?: { Value?: string; Position?: number }
  }
}

export class TimingStatsProcessor {
  private latestStats: Map<number, ProcessedTimingStats> = new Map()

  processTimingStats(statsData: any): ProcessedTimingStats[] {
    if (!statsData || !statsData.Lines) return []

    const processedStats: ProcessedTimingStats[] = []

    Object.entries(statsData.Lines).forEach(([driverNumber, data]: [string, any]) => {
      const driverNum = Number.parseInt(driverNumber)
      const existing = this.latestStats.get(driverNum)

      const processed: ProcessedTimingStats = {
        driver_number: driverNum,
        personal_best_lap_time: {
          Value: data?.PersonalBestLapTime?.Value ?? existing?.personal_best_lap_time?.Value ?? "",
          Lap: data?.PersonalBestLapTime?.Lap ?? existing?.personal_best_lap_time?.Lap ?? null,
          Position: data?.PersonalBestLapTime?.Position ?? existing?.personal_best_lap_time?.Position ?? null,
        },
        best_sectors: Array.isArray(data?.BestSectors)
          ? data.BestSectors.map((s: any, idx: number) => ({
              Value: s?.Value ?? existing?.best_sectors?.[idx]?.Value ?? "",
              Position: s?.Position ?? existing?.best_sectors?.[idx]?.Position ?? null,
            }))
          : existing?.best_sectors ?? [],
        best_speeds: {
          i1: data?.BestSpeeds?.I1
            ? {
                Value: data.BestSpeeds.I1.Value ?? existing?.best_speeds?.i1?.Value ?? "",
                Position: data.BestSpeeds.I1.Position ?? existing?.best_speeds?.i1?.Position ?? null,
              }
            : existing?.best_speeds?.i1 ?? undefined,
          i2: data?.BestSpeeds?.I2
            ? {
                Value: data.BestSpeeds.I2.Value ?? existing?.best_speeds?.i2?.Value ?? "",
                Position: data.BestSpeeds.I2.Position ?? existing?.best_speeds?.i2?.Position ?? null,
              }
            : existing?.best_speeds?.i2 ?? undefined,
          fl: data?.BestSpeeds?.FL
            ? {
                Value: data.BestSpeeds.FL.Value ?? existing?.best_speeds?.fl?.Value ?? "",
                Position: data.BestSpeeds.FL.Position ?? existing?.best_speeds?.fl?.Position ?? null,
              }
            : existing?.best_speeds?.fl ?? undefined,
          st: data?.BestSpeeds?.ST
            ? {
                Value: data.BestSpeeds.ST.Value ?? existing?.best_speeds?.st?.Value ?? "",
                Position: data.BestSpeeds.ST.Position ?? existing?.best_speeds?.st?.Position ?? null,
              }
            : existing?.best_speeds?.st ?? undefined,
        },
      }

      this.latestStats.set(driverNum, processed)
      processedStats.push(processed)
    })

    return processedStats
  }

  getDriverStats(driverNumber: number): ProcessedTimingStats | undefined {
    return this.latestStats.get(driverNumber)
  }

  getAllStats(): ProcessedTimingStats[] {
    return Array.from(this.latestStats.values())
  }
}