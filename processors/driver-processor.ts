export interface ProcessedDriver {
  driver_number: number
  name_acronym: string
  full_name: string
  team_name: string
  team_colour: string
  broadcast_name: string
  first_name: string
  last_name: string
}

export class DriverProcessor {
  private drivers: Map<number, ProcessedDriver> = new Map()

  processDriverList(driverList: any): ProcessedDriver[] {
    if (!driverList || typeof driverList !== "object") {
      return []
    }

    const processedDrivers: ProcessedDriver[] = []

    Object.entries(driverList).forEach(([driverNumber, data]: [string, any]) => {
      if (driverNumber === "_kf" || !data || typeof data !== "object") return 

      const driverNum = Number.parseInt(driverNumber)
      if (isNaN(driverNum)) return

      const processed: ProcessedDriver = {
        driver_number: driverNum,
        name_acronym: data.Tla || "",
        full_name: data.FullName || "",
        team_name: data.TeamName || "",
        team_colour: data.TeamColour || "",
        broadcast_name: data.BroadcastName || "",
        first_name: data.FirstName || "",
        last_name: data.LastName || "",
      }

      this.drivers.set(processed.driver_number, processed)
      processedDrivers.push(processed)
    })

    return processedDrivers
  }

  getDriver(driverNumber: number): ProcessedDriver | undefined {
    return this.drivers.get(driverNumber)
  }

  getAllDrivers(): ProcessedDriver[] {
    return Array.from(this.drivers.values())
  }
}
