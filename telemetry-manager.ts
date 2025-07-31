import { WebSocketManager, type WebSocketData, type SignalRMessage } from "./websocket/websocket-manager"
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
  lastUpdateTime: Date
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

    if (data.H && data.A) {
      if (data.H === "Streaming"){
        const dataType = data.A[0];
        const messageData = data.A[1];
        const timestamp = data.A[2];
        this.processDataByType(dataType, messageData, timestamp)
      }
    } 

    if (data.R) {
      const R = data.R
      Object.entries(R).forEach(([dataType, messageData]) => {
        if (messageData !== undefined) {
          this.processDataByType(dataType, messageData)
        }
      })
    }

    this.sendUpdate()
  }

  private processDataByType(dataType: string, messageData: any, timestamp?: string) {

    switch (dataType) {
      case "CarData":
        this.carDataProcessor.processCarData(messageData)
        break

      case "CarData.z":
        this.carDataProcessor.processCarData(null, messageData)
        break

      case "Position":
        this.positionDataProcessor.processPositionData(messageData)
        this.positionProcessor.processPositionData(messageData)
        break

      case "Position.z":
        this.positionDataProcessor.processPositionData(null, messageData)
        this.positionProcessor.processPositionData(null, messageData)
        break

      case "TopThree":
        this.positionProcessor.processTopThreeData(messageData)
        break

      case "TimingData":
        this.positionProcessor.processTimingDataPositions(messageData)
        this.timingProcessor.processTimingData(messageData)
        break

      case "TimingAppData":
        this.pitProcessor.processTimingAppData(messageData)
        break

      case "TyreStintSeries":
        this.pitProcessor.processTyreStintSeries(messageData)
        break

      case "WeatherData":
        this.weatherProcessor.processWeatherData(messageData)
        break

      case "DriverList":
        this.driverProcessor.processDriverList(messageData)
        break

      case "RaceControlMessages":
        this.raceControlProcessor.processRaceControlMessages(messageData)
        break

      case "PitStopSeries":
        this.pitProcessor.processPitStopSeries(messageData)
        break

      case "SessionInfo":
        this.sessionProcessor.processSessionInfo(messageData)
        break

      case "LapCount":
        this.sessionProcessor.processLapCount(messageData)
        break

      case "TrackStatus":
        this.sessionProcessor.processTrackStatus(messageData)
        break
    }
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
      stints: this.getAllStints(),
      session: this.sessionProcessor.getSessionInfo(),
      carData: this.carDataProcessor.getAllCarData(),
      positionData: this.positionDataProcessor.getAllPositions(),
      driversWithDRS: this.carDataProcessor.getDriversWithDRS(),
      lastUpdateTime: new Date()
    }

    this.onDataUpdateCallback(telemetryData)
  }

  private getAllStints(): ProcessedStint[] {
    const allStints: ProcessedStint[] = []

    // Obtener todos los stints de todos los pilotos
    for (let i = 1; i <= 99; i++) {
      const driverStints = this.pitProcessor.getDriverStints(i)
      allStints.push(...driverStints)
    }

    return allStints
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

  getDriverPositionData(driverNumber: number): ProcessedPositionData | undefined {
    return this.positionDataProcessor.getDriverPosition(driverNumber)
  }



}
