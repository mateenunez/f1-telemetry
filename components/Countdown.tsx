"use client"

import { useState, useEffect } from "react"

interface CountdownProps {
  totalSeconds?: number
  size?: number
  strokeWidth?: number
}

export function Countdown({
  totalSeconds = 0,
  size = 50,
  strokeWidth = 4,
}: CountdownProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) {
      if (remainingSeconds <= 0) {
        setIsActive(false)
      }
      return
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, remainingSeconds])

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (totalSeconds - remainingSeconds) / totalSeconds
  const offset = circumference * (1-progress)

  const centerX = size / 2
  const centerY = size / 2

  return (
    <div className="flex flex-col items-center justify-center bg-none">
      <style>{`
        @keyframes pulse-stroke {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .pulse-circle {
          animation: pulse-stroke 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="relative bg-none" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={centerX} cy={centerY} r={radius} strokeWidth={strokeWidth} fill="none" />

          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="pulse-circle"
            style={{
              transition: "stroke-dashoffset 1s linear",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-md font-bold font-mono text-offWhite">{remainingSeconds}</span>
        </div>
      </div>

    </div>
  )
}
