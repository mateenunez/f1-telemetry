export interface ProcessedRaceControl {
  message: string
  category: string
  flag?: string
  scope?: string
  sector?: number
  racing_number?: string
  date: string
  lap: number
  status: string
  mode: string
}

export class RaceControlProcessor {
  private messages: ProcessedRaceControl[] = [];
  private translatedMessages: ProcessedRaceControl[] = [];

  processRaceControlMessages(raceControlData: any, isTranslation: boolean = false): ProcessedRaceControl[] {
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

    if (isTranslation) {
      for (const msg of incoming) {
        const utc: string = msg.Utc || msg.date || new Date().toISOString()
        // buscar si ya existe el mensaje con misma Utc
        const idx = this.translatedMessages.findIndex(m => m.date === utc)

        const next: ProcessedRaceControl = {
          message: msg.Message ?? this.translatedMessages[idx]?.message ?? "",
          category: msg.Category ?? this.translatedMessages[idx]?.category ?? "",
          flag: msg.Flag ?? this.translatedMessages[idx]?.flag,
          scope: msg.Scope ?? this.translatedMessages[idx]?.scope,
          sector: msg.Sector ?? this.translatedMessages[idx]?.sector,
          racing_number: msg.RacingNumber ?? this.translatedMessages[idx]?.racing_number,
          date: utc,
          lap: msg.Lap ?? this.translatedMessages[idx]?.lap ?? 0,
          status: msg.Status ?? this.translatedMessages[idx]?.status ?? "",
          mode: msg.Mode ?? this.translatedMessages[idx]?.mode ?? "",
        }

        if (idx >= 0) {
          this.translatedMessages[idx] = next
          processedBatch.push(next)
        } else {
          this.translatedMessages.push(next)
          processedBatch.push(next)
        }
      }

    } else {
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
          status: msg.Status ?? this.messages[idx]?.status ?? "",
          mode: msg.Mode ?? this.messages[idx]?.mode ?? "",
        }

        if (idx >= 0) {
          this.messages[idx] = next
          processedBatch.push(next)
        } else {
          this.messages.push(next)
          processedBatch.push(next)
        }
      }
    }

    return processedBatch
  }

  getLatestMessages(count = 150): ProcessedRaceControl[] {
    return this.messages.slice(-count).reverse()
  }

  getLatestTranslatedMessages(count = 150): ProcessedRaceControl[] {
    return this.translatedMessages.slice(-count).reverse()
  }
  getAllMessages(): ProcessedRaceControl[] {
    return this.messages
  }
}