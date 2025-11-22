"use client";

import { Geist } from "next/font/google";
import type { ProcessedWeather } from "@/processors/weather-processor";
import { usePreferences } from "@/context/preferences";
import { CloudRain, Sun, Wind, Droplets, CloudSun } from "lucide-react";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface WeatherProps {
  weather: ProcessedWeather;
  dict: any;
}

interface ClimateConditionProps {
  label: string;
  value: number;
  unit?: string;
  minTemp?: number;
  maxTemp?: number;
}

interface ClimateCircleProps extends ClimateConditionProps {
  gradientColors: [string, string, string]; // [min, mid, max]
  size?: number;
}

const ClimateCondition = ({
  label,
  value,
  unit = "°C",
}: ClimateConditionProps) => {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-gray-400 text-md"
        style={{ fontFamily: mediumGeist.style.fontFamily }}
      >
        {label}
      </span>
      <span className="text-md text-offWhite">
        {value}
        {unit}
      </span>
    </div>
  );
};

const ClimateCircle = ({
  label,
  value,
  unit = "°C",
  minTemp = 0,
  maxTemp = 100,
  gradientColors,
  size = 80,
}: ClimateCircleProps) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (270 / 360) * circumference; // 270 degrees arc

  // Normalize value between minTemp and maxTemp to 0-1
  const normalizedValue = Math.min(
    Math.max((value - minTemp) / (maxTemp - minTemp), 0),
    1
  );

  // Calculate angle for the marker (arc starts at -135 degrees, spans 270 degrees)
  const startAngle = -135;
  const angleRange = 270;
  const currentAngle = startAngle + normalizedValue * angleRange;
  const angleRad = (currentAngle * Math.PI) / 180;

  // Calculate position of the marker on the circle edge
  const markerRadius = radius;
  const markerX = 50 + markerRadius * Math.cos(angleRad - Math.PI / 2);
  const markerY = 50 + markerRadius * Math.sin(angleRad - Math.PI / 2);

  // Convert hex colors to format for SVG gradient
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const color1 = hexToRgb(gradientColors[0]) || { r: 34, g: 197, b: 94 };
  const color2 = hexToRgb(gradientColors[1]) || { r: 234, g: 179, b: 8 };
  const color3 = hexToRgb(gradientColors[2]) || { r: 239, g: 68, b: 68 };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          width={size}
          height={size}
        >
          <defs>
            {/* Linear gradient for the arc */}
            <linearGradient
              id={`gradient-${label}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="10%"
                stopColor={`rgb(${color1.r}, ${color1.g}, ${color1.b})`}
              />
              <stop
                offset="50%"
                stopColor={`rgb(${color2.r}, ${color2.g}, ${color2.b})`}
              />
              <stop
                offset="100%"
                stopColor={`rgb(${color3.r}, ${color3.g}, ${color3.b})`}
              />
            </linearGradient>
          </defs>

          {/* Full gradient circle (always complete) */}
          <circle
            cx={50}
            cy={50}
            r={radius}
            fill="none"
            stroke={`url(#gradient-${label})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(135 50 50)`}
            style={{ filter: 'brightness(1.1) saturate(1.2)' }}
          />

          {/* White marker (rectangle) at the current value position */}
          <g
            transform={`translate(${markerX}, ${markerY}) rotate(${currentAngle})`}
          >
            <rect
              x={-1.5}
              y={-strokeWidth / 2 - 2}
              width={3}
              height={strokeWidth + 4}
              fill="white"
              rx={0.5}
            />
          </g>

          {/* Value text in center */}
          <text
            x={50}
            y={50}
            fill="rgb(255, 255, 255)"
            fontSize="20"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="middle"
            style={mediumGeist.style}
          >
            {Math.round(value)}
            {unit}
          </text>
          <text
            x={50}
            y={80}
            fill="rgb(255, 255, 255)"
            fontSize="12"
            fontFamily="monospace"
            textAnchor="middle"
            dominantBaseline="middle"
            style={mediumGeist.style}
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default function Weather({ weather, dict }: WeatherProps) {
  const { preferences } = usePreferences();

  // Función helper para obtener las traducciones basadas en preferences.translate
  const getWeatherLabel = (
    key: "rain" | "track" | "air" | "humidity" | "wind" | "pressure"
  ) => {
    const translations = {
      rain: preferences.translate ? "Lluvia" : "Rain",
      track: preferences.translate ? "Pista" : "Track",
      air: preferences.translate ? "Aire" : "Air",
      humidity: preferences.translate ? "Humedad" : "Humidity",
      wind: preferences.translate ? "Viento" : "Wind",
      pressure: preferences.translate ? "Presión" : "Pressure",
    };
    return translations[key];
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-8 w-8 text-gray-300" />;
    if (weather.rainfall > 0)
      return <CloudRain className="h-8 w-8 text-gray-300" />;
    if (weather.humidity >= 60)
      return <CloudSun className="h-8 w-8 text-gray-300" />;
    return <Sun className="h-8 w-8 text-gray-300" />;
  };

  const getWindDirection = () => {
    if (!weather.wind_direction) return "--";
    const angle = weather.wind_direction % 360;

    const directionIndex = Math.round(angle / 45) % 8;

    if (preferences.translate) {
      switch (directionIndex) {
        case 0:
          return "N";
        case 1:
          return "NE";
        case 2:
          return "E";
        case 3:
          return "SE";
        case 4:
          return "S";
        case 5:
          return "SO";
        case 6:
          return "O";
        case 7:
          return "NO";
        default:
          return "N";
      }
    } else {
      switch (directionIndex) {
        case 0:
          return "N";
        case 1:
          return "NE";
        case 2:
          return "E";
        case 3:
          return "SE";
        case 4:
          return "S";
        case 5:
          return "SW";
        case 6:
          return "W";
        case 7:
          return "NW";
        default:
          return "N";
      }
    }
  };

  if (preferences.weatherDetailed) {
    return (
      <div className="flex flex-row gap-2 items-center text-offWhite">
        <ClimateCondition
          label={getWeatherLabel("rain")}
          value={weather.rainfall}
          unit=""
        />
        <ClimateCondition
          label={getWeatherLabel("track")}
          value={weather.track_temperature}
        />
        <ClimateCondition
          label={getWeatherLabel("air")}
          value={weather.air_temperature}
        />
        <ClimateCondition
          label={getWeatherLabel("humidity")}
          value={weather.humidity}
          unit="%"
        />
        <ClimateCondition
          label={getWeatherLabel("wind")}
          value={weather.wind_speed}
          unit="m/s"
        />
        <ClimateCondition
          label={getWeatherLabel("pressure")}
          value={weather.pressure}
          unit="mb"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2 items-center text-offWhite">
      <div className="flex flex-col items-center">
        <div className="flex flex-row text-xs gap-1">
          <span className="text-f1Blue">{getWindDirection()}</span>
          <span className="text-xs">{weather.wind_speed} m/s</span>
        </div>
        {getWeatherIcon()}
      </div>
      <ClimateCircle
        label={getWeatherLabel("track")}
        value={weather.track_temperature}
        unit="°C"
        minTemp={5}
        maxTemp={45}
        gradientColors={["#A6051A", "#ffe066", "#51cf66"]}
      />
      <ClimateCircle
        label={getWeatherLabel("air")}
        value={weather.air_temperature}
        unit="°C"
        minTemp={5}
        maxTemp={35}
        gradientColors={["#A6051A", "#ffe066", "#51cf66"]}
      />
      <ClimateCircle
        label="Hum."
        value={weather.humidity}
        unit="%"
        minTemp={0}
        maxTemp={100}
        gradientColors={["#3b82f6", "#60a5fa", "#93c5fd"]}
      />
    </div>
  );
}
