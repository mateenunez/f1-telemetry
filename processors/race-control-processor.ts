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

    const toArray = (msgs: any): any[] => {
      if (Array.isArray(msgs)) return msgs
      if (typeof msgs === 'object' && msgs !== null) {
        return Object.values(msgs)
      }
      return []
    }

    const incoming = toArray(raceControlData.Messages)
    const processedBatch: ProcessedRaceControl[] = []

    for (const msg of incoming) {
      const utc: string = msg.Utc || msg.date || new Date().toISOString()

      // buscar si ya existe el mensaje con misma Utc
      const idx = this.messages.findIndex(m => m.date === utc)

      const next: ProcessedRaceControl = {
        message: msg.Message ?? this.messages[idx]?.message ?? "",
        category: msg.Category ?? this.messages[idx]?.category ?? "",
        flag: msg.Flag ?? this.messages[idx]?.flag,
        scope: msg.Scope ?? this.messages[idx]?.scope,
        sector: msg.Sector ?? this.messages[idx]?.sector,
        racing_number: msg.RacingNumber ?? this.messages[idx]?.racing_number,
        date: utc,
        lap: msg.Lap ?? this.messages[idx]?.lap ?? 0,
      }

      if (idx >= 0) {
        this.messages[idx] = next
        processedBatch.push(next)
      } else {
        this.messages.push(next)
        processedBatch.push(next)
      }
    }

    // Mantener solo los últimos 15 (por fecha de llegada, y el getLatest revierte)
    this.messages = this.messages.slice(-15)

    return processedBatch
  }

  getLatestMessages(count = 10): ProcessedRaceControl[] {
    return this.messages.slice(-count).reverse()
  }

  getAllMessages(): ProcessedRaceControl[] {
    return this.messages
  }
}