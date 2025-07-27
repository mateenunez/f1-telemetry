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
  stint_number: number
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

      if (Array.isArray(stops)) {
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
      }

    })

    return allPitStops
  }

  processTyreStintSeries(stintData: any): ProcessedStint[] {

    if (!stintData || !stintData.Stints) {
      return []
    }

    const allStints: ProcessedStint[] = []

    Object.entries(stintData.Stints).forEach(([driverNumber, stints]: [string, any]) => {
      const driverNum = Number.parseInt(driverNumber)

      // Obtener stints existentes o crear array vacío
      const existingStints = this.stints.get(driverNum) || []

      Object.entries(stints).forEach(([stintIndex, stint]: [string, any]) => {
        const stintNum = Number.parseInt(stintIndex)

        // Buscar stint existente o crear nuevo
        let existingStint = existingStints.find((s) => s.stint_number === stintNum)

        if (!existingStint) {
          existingStint = {
            driver_number: driverNum,
            compound: "UNKNOWN",
            is_new: false,
            total_laps: 0,
            start_laps: 0,
            lap_flags: 0,
            lap_time: "",
            lap_number: 0,
            stint_number: stintNum,
          }
          existingStints.push(existingStint)
        }

        // Actualizar solo los campos que vienen en los datos
        const updated: ProcessedStint = {
          ...existingStint,
          compound: stint.Compound !== undefined ? stint.Compound : existingStint.compound,
          is_new: stint.New !== undefined ? stint.New === "true" : existingStint.is_new,
          total_laps: stint.TotalLaps !== undefined ? Number.parseInt(stint.TotalLaps) : existingStint.total_laps,
          start_laps: stint.StartLaps !== undefined ? Number.parseInt(stint.StartLaps) : existingStint.start_laps,
          lap_flags: stint.LapFlags !== undefined ? Number.parseInt(stint.LapFlags) : existingStint.lap_flags,
          lap_time: stint.LapTime !== undefined ? stint.LapTime : existingStint.lap_time,
          lap_number: stint.LapNumber !== undefined ? Number.parseInt(stint.LapNumber) : existingStint.lap_number,
        }

        // Actualizar en el array existente
        const index = existingStints.findIndex((s) => s.stint_number === stintNum)
        existingStints[index] = updated
        allStints.push(updated)
      })

      this.stints.set(driverNum, existingStints)
    })

    return allStints
  }

  processTimingAppData(timingAppData: any): ProcessedStint[] {

    if (!timingAppData || !timingAppData.Lines) {
      return []
    }

    const allStints: ProcessedStint[] = []

    Object.entries(timingAppData.Lines).forEach(([driverNumber, data]: [string, any]) => {
      const driverNum = Number.parseInt(driverNumber)

      if (data.Stints) {
        // Obtener stints existentes o crear array vacío
        const existingStints = this.stints.get(driverNum) || []

        Object.entries(data.Stints).forEach(([stintIndex, stint]: [string, any]) => {
          const stintNum = Number.parseInt(stintIndex)

          // Buscar stint existente o crear nuevo
          let existingStint = existingStints.find((s) => s.stint_number === stintNum)

          if (!existingStint) {
            existingStint = {
              driver_number: driverNum,
              compound: "UNKNOWN",
              is_new: false,
              total_laps: 0,
              start_laps: 0,
              lap_flags: 0,
              lap_time: "",
              lap_number: 0,
              stint_number: stintNum,
            }
            existingStints.push(existingStint)
          }

          // Actualizar solo los campos que vienen en los datos
          const updated: ProcessedStint = {
            ...existingStint,
            compound: stint.Compound !== undefined ? stint.Compound : existingStint.compound,
            is_new: stint.New !== undefined ? stint.New === "true" : existingStint.is_new,
            total_laps: stint.TotalLaps !== undefined ? Number.parseInt(stint.TotalLaps) : existingStint.total_laps,
            start_laps: stint.StartLaps !== undefined ? Number.parseInt(stint.StartLaps) : existingStint.start_laps,
            lap_flags: stint.LapFlags !== undefined ? Number.parseInt(stint.LapFlags) : existingStint.lap_flags,
            lap_time: stint.LapTime !== undefined ? stint.LapTime : existingStint.lap_time,
            lap_number: stint.LapNumber !== undefined ? Number.parseInt(stint.LapNumber) : existingStint.lap_number,
          }

          // Actualizar en el array existente
          const index = existingStints.findIndex((s) => s.stint_number === stintNum)
          existingStints[index] = updated
          allStints.push(updated)

        })

        this.stints.set(driverNum, existingStints)
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
