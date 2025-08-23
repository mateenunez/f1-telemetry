import { decompressData } from "../utils/compression"

export interface ProcessedPositionData {
  driver_number: number
  X: number
  Y: number
  Z: number
  Status: string
}

export interface PositionData {
    timeStamp: Date,
    Entries: ProcessedPositionData[]
}

export interface Position{
  Position: PositionData[]
}

export class PositionDataProcessor {
  private latestPositions: Map<number, ProcessedPositionData> = new Map()

  processPositionData(positionData: any, compressedData?: string): ProcessedPositionData[] {
    let data: Position | null = null;

    // Si hay datos comprimidos, descomprimirlos primero
    if (compressedData) {
      try {
        data = decompressData(compressedData)
      } catch (error) {
        console.error("Error decompressing position data:", error)
      }
    }

    // Si no se pudo descomprimir, usar datos normales
    if (!data && positionData) {
      data = positionData;
    }

    const processedPositions: ProcessedPositionData[] = []

    if (Array.isArray(data?.Position) && data.Position.length > 0) {
    const last = data.Position[data.Position.length - 1];
    const entriesObj = last.Entries;

    for (const [driverStr, entry] of Object.entries(entriesObj)) {
      const driver_number = Number(driverStr);
      processedPositions.push({
        driver_number,
        X: entry.X,
        Y: entry.Y,
        Z: entry.Z,
        Status: entry.Status,
      });
      this.latestPositions.set(driver_number, {
        driver_number,
        X: entry.X,
        Y: entry.Y,
        Z: entry.Z,
        Status: entry.Status,
      });
    }

  }
    return processedPositions;

}

  getDriverPosition(driverNumber: number): ProcessedPositionData | undefined {
    return this.latestPositions.get(driverNumber)
  }

  getAllPositions(): ProcessedPositionData[] {
    return Array.from(this.latestPositions.values())
  }

  getPositionsForMap(): { [key: number]: { x: number; y: number; z: number; status: string } } {
    const positions: { [key: number]: { x: number; y: number; z: number; status: string } } = {}

    this.latestPositions.forEach((position, driverNumber) => {
      positions[driverNumber] = {
        x: position.X,
        y: position.Y,
        z: position.Z,
        status: position.Status,
      }
    })

    return positions
  }
  }
