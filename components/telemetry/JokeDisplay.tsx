import { ProcessedJoke } from "@/processors";
import React, { useEffect, useState } from "react";

interface JokeDisplayProps {
  joke: ProcessedJoke;
  canvasWidth: number;
  canvasHeight: number;
}

export const JokeDisplay: React.FC<JokeDisplayProps> = ({
  joke,
  canvasWidth,
  canvasHeight,
}) => {
  let absoluteX =
    typeof joke.coords?.xPct === "number"
      ? (joke.coords.xPct / 100) * (canvasWidth || 0)
      : 0;
  let absoluteY =
    typeof joke.coords?.yPct === "number"
      ? (joke.coords.yPct / 100) * (canvasHeight || 0)
      : 0;

  const jokeWidth = 100; // Approximate width of joke box
  const jokeHeight = 50; // Approximate height of joke box
  const padding = 10;

  absoluteX = Math.max(
    jokeWidth / 2 + padding,
    Math.min(absoluteX, canvasWidth - jokeWidth / 2 - padding),
  );

  absoluteY = Math.max(
    jokeHeight / 2 + padding,
    Math.min(absoluteY, canvasHeight - jokeHeight / 2 - padding),
  );

  return (
    <div
      className={`absolute pointer-events-none transition-all duration-300 opacity-100 scale-100`}
      style={{
        left: `${absoluteX}px`,
        top: `${absoluteY}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-lg">
        <div
          className="text-sm font-bold mb-1"
          style={{ color: joke.color }}
        >
          {joke.user.username}
        </div>

        <div className="text-xs text-gray-200 max-w-xs break-words">
          {joke.content}
        </div>
      </div>

      <div
        className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
        style={{
          borderTopColor: "rgba(0, 0, 0, 0.8)",
          bottom: "-8px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
};
