"use client";

import { ProcessedStint } from "@/processors/pit-processor";
import { Geist } from "next/font/google";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

interface TyresProps {
  currentStint: ProcessedStint | undefined;
}

export default function Tyres({ currentStint }: TyresProps) {
  const getCompoundSvg = (compound: string, iconSize: number) => {
    const iconMap: Record<string, string> = {
      SOFT: "/soft.svg",
      MEDIUM: "/medium.svg",
      HARD: "/hard.svg",
    };
    const key = (compound || "").toUpperCase();
    const src = iconMap[key] || "/unknown.svg";
    return (
      <img
        src={src}
        alt={key}
        width={iconSize}
        height={iconSize}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    );
  };

  return (
    <div
      className="flex items-center flex-row text-xs gap-2 p-2 md:p-2 lg:p-0"
      style={mediumGeist.style}
    >
      {currentStint && (
        <div className="flex flex-col items-center justify-center text-gray-400">
          {getCompoundSvg(currentStint.compound, 30)}
        <p>{currentStint.total_laps} L</p>
        </div>
      )}
    </div>
  );
}
