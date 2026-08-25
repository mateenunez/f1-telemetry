import { TelemetryManager } from "./telemetry-manager"

let instance: TelemetryManager | null = null

export function getTelemetryManager(): TelemetryManager {
  if (!instance) {
    instance = new TelemetryManager()
  }
  return instance
}