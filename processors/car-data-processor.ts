import { decompressData } from "../utils/compression"

export interface ProcessedCarData {
  driver_number: number
  rpm: number
  speed: number
  gear: number
  throttle: number
  brake: number
  drs: boolean
  ers_deploy: number
  ers_harvest: number
  date: string
}

export class CarDataProcessor {
  private latestCarData: Map<number, ProcessedCarData> = new Map()

  processCarData(carData: any, compressedData?: string): ProcessedCarData[] {
    let data: any = null

    // Si hay datos comprimidos, descomprimirlos primero
    if (compressedData) {
      try {
        data = decompressData(compressedData)
      } catch (error) {
        console.error("Error decompressing car data:", error)
      }
    }

    // Si hay datos normales, usarlos
    if (carData) {
      data = carData
    }

    if (!data || !data.Entries) {
      return []
    }

    const processedCarData: ProcessedCarData[] = []

    data.Entries.forEach((entry: any) => {
      if (entry.Cars) {
        Object.entries(entry.Cars).forEach(([driverNumber, car]: [string, any]) => {
          const processed: ProcessedCarData = {
            driver_number: Number.parseInt(driverNumber),
            rpm: car.Rpm || 0,
            speed: car.Speed || 0,
            gear: car.nGear || 0,
            throttle: car.Throttle || 0,
            brake: car.Brake || 0,
            drs: car.DRS === 1 || car.DRS === true,
            ers_deploy: car.ERS?.Deploy || 0,
            ers_harvest: car.ERS?.Harvest || 0,
            date: entry.Utc || new Date().toISOString(),
          }

          this.latestCarData.set(processed.driver_number, processed)
          processedCarData.push(processed)
        })
      }
    })

    return processedCarData
  }

  getDriverCarData(driverNumber: number): ProcessedCarData | undefined {
    return this.latestCarData.get(driverNumber)
  }

  getAllCarData(): ProcessedCarData[] {
    return Array.from(this.latestCarData.values())
  }

  getDriversWithDRS(): number[] {
    return Array.from(this.latestCarData.values())
      .filter((data) => data.drs)
      .map((data) => data.driver_number)
  }
}
