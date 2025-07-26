export interface SignalRMessage {
  H: string
  M: string
  A: [string, any, string]
}

export interface WebSocketData {
  R?: {
    Heartbeat?: any
    "CarData.z"?: string
    "Position.z"?: string
    CarData?: any
    Position?: any
    ExtrapolatedClock?: any
    TopThree?: any
    TimingStats?: any
    TimingAppData?: any
    WeatherData?: any
    TrackStatus?: any
    DriverList?: any
    RaceControlMessages?: any
    SessionInfo?: any
    SessionData?: any
    LapCount?: any
    TimingData?: any
    ChampionshipPrediction?: any
    TyreStintSeries?: any
    PitStopSeries?: any
  },
  M?: SignalRMessage[],
  C?: string,
  signalRMessages?: SignalRMessage[]

}

export class WebSocketManager {
  private ws: WebSocket | null = null
  private onDataCallback: ((data: WebSocketData) => void) | null = null

  connect(url: string, onData: (data: WebSocketData) => void) {
    this.onDataCallback = onData

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log("WebSocket connected")
    }

    this.ws.onmessage = async (event) => {
      try {
        const blob = event.data;
        const text = await blob.text()
        const rawData = JSON.parse(text) as WebSocketData
        const processedData: WebSocketData = {}

        if (rawData.M && Array.isArray(rawData.M)) {
          processedData.M = rawData.M as SignalRMessage[]
        }

        else if (rawData.R) {
          processedData.R = rawData.R
        }

        if (this.onDataCallback) {
          this.onDataCallback(rawData)
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error)
      }
    }

    this.ws.onclose = () => {
      console.log("WebSocket disconnected")
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
