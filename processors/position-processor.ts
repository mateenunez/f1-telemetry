export interface ProcessedPosition {
  driver_number: number
  position: number
  date: string
}

export class PositionProcessor {
  private latestPositions: Map<number, ProcessedPosition> = new Map()

  processPositionData(positionData: any, compressedData?: string): ProcessedPosition[] {
    const processedPositions: ProcessedPosition[] = []

    // Procesar datos normales de Position si existen
    if (positionData) {
      const positions = Array.isArray(positionData) ? positionData : [positionData]
      positions.forEach((pos: any) => {
        if (pos.RacingNumber && pos.Position) {
          const processed: ProcessedPosition = {
            driver_number: Number.parseInt(pos.RacingNumber),
            position: Number.parseInt(pos.Position),
            date: new Date().toISOString(),
          }
          this.latestPositions.set(processed.driver_number, processed)
          processedPositions.push(processed)
        }
      })
    }

    return processedPositions
  }

  // Nuevo método para procesar TopThree
  processTopThreeData(topThreeData: any): ProcessedPosition[] {
    if (!topThreeData || !topThreeData.Lines) {
      return []
    }

    const processedPositions: ProcessedPosition[] = []

      Object.entries(topThreeData.Lines).forEach(([driverNumber, line]: [string, any]) => {
      if (line.RacingNumber && line.Position) {
        const processed: ProcessedPosition = {
          driver_number: Number.parseInt(line.RacingNumber),
          position: Number.parseInt(line.Position),
          date: new Date().toISOString(),
        }
        this.latestPositions.set(processed.driver_number, processed)
        processedPositions.push(processed)
      }
    })

    return processedPositions
  }

  // Nuevo método para procesar TimingData positions
  processTimingDataPositions(timingData: any): ProcessedPosition[] {
    if (!timingData || !timingData.Lines) {
      return []
    }

    const processedPositions: ProcessedPosition[] = []

    Object.entries(timingData.Lines).forEach(([driverNumber, data]: [string, any]) => {
      if (data.Position) {
        const processed: ProcessedPosition = {
          driver_number: Number.parseInt(driverNumber),
          position: Number.parseInt(data.Position),
          date: new Date().toISOString(),
        }
        this.latestPositions.set(processed.driver_number, processed)
        processedPositions.push(processed)
      }
    })

    return processedPositions
  }

  getCurrentPositions(): ProcessedPosition[] {
    return Array.from(this.latestPositions.values()).sort((a, b) => a.position - b.position)
  }

  getDriverPosition(driverNumber: number): ProcessedPosition | undefined {
    return this.latestPositions.get(driverNumber)
  }
}
