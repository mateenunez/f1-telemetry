"use client"

import { useEffect, useRef } from "react"

interface ColorShiftProps {
  text: string
  className?: string
  animateLetters?: boolean
  letterDelay?: number
  letterColor?: string
}

export function ColorShift({
  text,
  className = "",
  animateLetters = false,
  letterDelay = 100,
  letterColor = "#ef4444",
}: ColorShiftProps) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!animateLetters || !containerRef.current) return

    const letters = containerRef.current.querySelectorAll(".animated-letter")

    letters.forEach((letter, index) => {
      const element = letter as HTMLElement
      setTimeout(() => {
        element.style.color = letterColor
      }, letterDelay)
    })
  }, [animateLetters, letterDelay, letterColor])

  if (!animateLetters) {
    return <span className={className}>{text}</span>
  }

  return (
    <span ref={containerRef} className={className}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="animated-letter inline-block transition-colors duration-500 ease-in-out"
          style={{ color: "inherit" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  )
}
