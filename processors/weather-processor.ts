export interface ProcessedWeather {
  air_temperature: number
  track_temperature: number
  humidity: number
  pressure: number
  rainfall: number
  wind_direction: number
  wind_speed: number
  date: string
}

export class WeatherProcessor {
  private latestWeather: ProcessedWeather | null = null

  processWeatherData(weatherData: any): ProcessedWeather | null {
    if (!weatherData) {
      return null
    }

    const processed: ProcessedWeather = {
      air_temperature: Number.parseFloat(weatherData.AirTemp) || 0,
      track_temperature: Number.parseFloat(weatherData.TrackTemp) || 0,
      humidity: Number.parseFloat(weatherData.Humidity) || 0,
      pressure: Number.parseFloat(weatherData.Pressure) || 0,
      rainfall: Number.parseFloat(weatherData.Rainfall) || 0,
      wind_direction: Number.parseFloat(weatherData.WindDirection) || 0,
      wind_speed: Number.parseFloat(weatherData.WindSpeed) || 0,
      date: new Date().toISOString(),
    }

    this.latestWeather = processed
    return processed
  }

  getLatestWeather(): ProcessedWeather | null {
    return this.latestWeather
  }
}
