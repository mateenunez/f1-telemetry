import { WebSocketManager, type WebSocketData } from "./websocket/websocket-manager"
import { PositionProcessor, type ProcessedPosition } from "./processors/position-processor"
import { TimingProcessor, type ProcessedTiming } from "./processors/timing-processor"
import { WeatherProcessor, type ProcessedWeather } from "./processors/weather-processor"
import { DriverProcessor, type ProcessedDriver } from "./processors/driver-processor"
import { RaceControlProcessor, type ProcessedRaceControl } from "./processors/race-control-processor"
import { PitProcessor, type ProcessedPitStop, type ProcessedStint } from "./processors/pit-processor"
import { SessionProcessor, type ProcessedSession } from "./processors/session-processor"
import { CarDataProcessor, type ProcessedCarData } from "./processors/car-data-processor"
import { PositionDataProcessor, type ProcessedPositionData } from "./processors/position-data-processor"

export interface TelemetryData {
  positions: ProcessedPosition[]
  timing: ProcessedTiming[]
  weather: ProcessedWeather | null
  drivers: ProcessedDriver[]
  raceControl: ProcessedRaceControl[]
  pitStops: ProcessedPitStop[]
  stints: ProcessedStint[]
  session: ProcessedSession | null
  carData: ProcessedCarData[]
  positionData: ProcessedPositionData[]
  driversWithDRS: number[]
}

export class TelemetryManager {
  private wsManager: WebSocketManager
  private positionProcessor: PositionProcessor
  private timingProcessor: TimingProcessor
  private weatherProcessor: WeatherProcessor
  private driverProcessor: DriverProcessor
  private raceControlProcessor: RaceControlProcessor
  private pitProcessor: PitProcessor
  private sessionProcessor: SessionProcessor
  private carDataProcessor: CarDataProcessor
  private positionDataProcessor: PositionDataProcessor

  private onDataUpdateCallback: ((data: TelemetryData) => void) | null = null

  constructor() {
    this.wsManager = new WebSocketManager()
    this.positionProcessor = new PositionProcessor()
    this.timingProcessor = new TimingProcessor()
    this.weatherProcessor = new WeatherProcessor()
    this.driverProcessor = new DriverProcessor()
    this.raceControlProcessor = new RaceControlProcessor()
    this.pitProcessor = new PitProcessor()
    this.sessionProcessor = new SessionProcessor()
    this.carDataProcessor = new CarDataProcessor()
    this.positionDataProcessor = new PositionDataProcessor()
  }

  connect(url: string, onDataUpdate: (data: TelemetryData) => void) {
    this.onDataUpdateCallback = onDataUpdate

    this.wsManager.connect(url, (data: WebSocketData) => {
      this.processWebSocketData(data)
    })
  }

  private processWebSocketData(data: WebSocketData) {
    const R = data.R
    if (!R) return

    // Procesar CarData comprimido
    if (R.CarData || R["CarData.z"]) {
      this.carDataProcessor.processCarData(R.CarData, R["CarData.z"])
    }

    // Procesar Position comprimido
    if (R.Position || R["Position.z"]) {
      this.positionDataProcessor.processPositionData(R.Position, R["Position.z"])
      this.positionProcessor.processPositionData(R.Position, R["Position.z"])
    }

    // Procesar TopThree para posiciones
    if (R.TopThree) {
      this.positionProcessor.processTopThreeData(R.TopThree)
    }

    // Procesar TimingData para posiciones y timing
    if (R.TimingData) {
      this.positionProcessor.processTimingDataPositions(R.TimingData)
      this.timingProcessor.processTimingData(R.TimingData)
    }

    if (R.WeatherData) {
      this.weatherProcessor.processWeatherData(R.WeatherData)
    }

    if (R.DriverList) {
      this.driverProcessor.processDriverList(R.DriverList)
    }

    if (R.RaceControlMessages) {
      this.raceControlProcessor.processRaceControlMessages(R.RaceControlMessages)
    }

    if (R.PitStopSeries) {
      this.pitProcessor.processPitStopSeries(R.PitStopSeries)
    }

    if (R.TyreStintSeries) {
      this.pitProcessor.processTyreStintSeries(R.TyreStintSeries)
    }

    // Procesar TimingAppData para stints
    if (R.TimingAppData) {
      this.pitProcessor.processTimingAppData(R.TimingAppData)
    }

    if (R.SessionInfo) {
      this.sessionProcessor.processSessionInfo(R.SessionInfo)
    }

    if (R.LapCount) {
      this.sessionProcessor.processLapCount(R.LapCount)
    }

    if (R.TrackStatus) {
      this.sessionProcessor.processTrackStatus(R.TrackStatus)
    }

    // Enviar datos actualizados al callback
    this.sendUpdate()
  }

  private sendUpdate() {
    if (!this.onDataUpdateCallback) return

    const telemetryData: TelemetryData = {
      positions: this.positionProcessor.getCurrentPositions(),
      timing: this.timingProcessor.getAllTiming(),
      weather: this.weatherProcessor.getLatestWeather(),
      drivers: this.driverProcessor.getAllDrivers(),
      raceControl: this.raceControlProcessor.getLatestMessages(),
      pitStops: [],
      stints: [],
      session: this.sessionProcessor.getSessionInfo(),
      carData: this.carDataProcessor.getAllCarData(),
      positionData: this.positionDataProcessor.getAllPositions(),
      driversWithDRS: this.carDataProcessor.getDriversWithDRS(),
    }

    this.onDataUpdateCallback(telemetryData)
  }

  disconnect() {
    this.wsManager.disconnect()
  }

  // Métodos para obtener datos específicos
  getDriverPosition(driverNumber: number): ProcessedPosition | undefined {
    return this.positionProcessor.getDriverPosition(driverNumber)
  }

  getDriverTiming(driverNumber: number): ProcessedTiming | undefined {
    return this.timingProcessor.getDriverTiming(driverNumber)
  }

  getDriverStints(driverNumber: number): ProcessedStint[] {
    return this.pitProcessor.getDriverStints(driverNumber)
  }

  getCurrentStint(driverNumber: number): ProcessedStint | undefined {
    return this.pitProcessor.getCurrentStint(driverNumber)
  }

  getDriverCarData(driverNumber: number): ProcessedCarData | undefined {
    return this.carDataProcessor.getDriverCarData(driverNumber)
  }



}
