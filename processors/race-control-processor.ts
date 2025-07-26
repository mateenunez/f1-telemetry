export interface ProcessedRaceControl {
  message: string
  category: string
  flag?: string
  scope?: string
  sector?: number
  racing_number?: string
  date: string
  lap: number
}

export class RaceControlProcessor {
  private messages: ProcessedRaceControl[] = []

  processRaceControlMessages(raceControlData: any): ProcessedRaceControl[] {
    if (!raceControlData || !raceControlData.Messages) {
      return []
    }

    const processedMessages: ProcessedRaceControl[] = []
    var processed: ProcessedRaceControl

    if (Array.isArray(raceControlData.Messages)){
    raceControlData.Messages.forEach((message: any) => {
       processed = {
        message: message.Message || "",
        category: message.Category || "",
        flag: message.Flag,
        scope: message.Scope,
        sector: message.Sector,
        racing_number: message.RacingNumber,
        date: message.Utc || new Date().toISOString(),
        lap: message.Lap || 0,
      }

      processedMessages.push(processed)
    })
  }
    // Mantener solo los últimos 50 mensajes
    this.messages = [...this.messages, ...processedMessages].slice(-50)

    return processedMessages
  
}

  getLatestMessages(count = 5): ProcessedRaceControl[] {
    return this.messages.slice(-count).reverse()
  }

  getAllMessages(): ProcessedRaceControl[] {
    return this.messages
  }
}
