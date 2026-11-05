"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface CircuitData {
  d: string;
  viewBox: string;
  transform?: string;
}

export type CircuitAnimation = "trace" | "trail";

interface AnimatedCircuitProps {
  src: string;
  className?: string;
  animation?: CircuitAnimation;
}

const TRAIL_STEPS = 12;
const HEAD_LENGTH = 0.07;
const TAIL_LENGTH = 0.92;
const LOOP_DURATION = 20;

// Capas de la estela: cuanto más larga, más tenue y más ancha.
const trailLayers = Array.from({ length: TRAIL_STEPS }, (_, index) => {
  const progress = index / (TRAIL_STEPS - 1);

  return {
    length: HEAD_LENGTH + (TAIL_LENGTH - HEAD_LENGTH) * progress,
    opacity: 0.18 * Math.pow(1 - progress, 1.7) + 0.025,
    width: 18 + progress * 42,
  };
});

// Los SVG de los circuitos incluyen varios subpaths (bordes interior y
// exterior). Usamos solo el primero para animar una única línea.
function getFirstSubpath(pathData: string): string {
  const firstMove = pathData.search(/[Mm]/);

  if (firstMove === -1) return pathData;

  const nextMove = pathData.slice(firstMove + 1).search(/[Mm]/);

  if (nextMove === -1) return pathData;

  return pathData.slice(0, firstMove + 1 + nextMove).trim();
}

function parseCircuit(svgText: string): CircuitData | null {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  const path = doc.querySelector("path");

  if (!svg || !path) return null;

  const d = path.getAttribute("d");
  const viewBox = svg.getAttribute("viewBox");

  if (!d || !viewBox) return null;

  const group = path.parentElement;
  const transform =
    group?.tagName.toLowerCase() === "g"
      ? (group.getAttribute("transform") ?? undefined)
      : undefined;

  return { d: getFirstSubpath(d), viewBox, transform };
}

const circuitCache = new Map<string, Promise<CircuitData | null>>();

function loadCircuit(src: string): Promise<CircuitData | null> {
  const cached = circuitCache.get(src);

  if (cached) return cached;

  const request = fetch(src)
    .then((response) => {
      if (!response.ok) throw new Error("Could not load circuit");
      return response.text();
    })
    .then(parseCircuit)
    .catch(() => {
      circuitCache.delete(src);
      return null;
    });

  circuitCache.set(src, request);
  return request;
}

export default function AnimatedCircuit({
  src,
  className,
  animation = "trail",
}: AnimatedCircuitProps) {
  const [circuit, setCircuit] = useState<CircuitData | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    setCircuit(null);

    loadCircuit(src).then((data) => {
      if (!cancelled) setCircuit(data);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!circuit) return null;

  return (
    <svg
      viewBox={circuit.viewBox}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g transform={circuit.transform}>
        {animation === "trace" ? (
          <TracePath
            d={circuit.d}
            reducedMotion={Boolean(shouldReduceMotion)}
          />
        ) : shouldReduceMotion ? (
          <path
            d={circuit.d}
            fill="none"
            stroke="currentColor"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.35}
          />
        ) : (
          trailLayers.map((layer) => {
            const start = 1 - layer.length;

            return (
              <path
                key={layer.length}
                d={circuit.d}
                fill="none"
                stroke="currentColor"
                strokeWidth={layer.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={layer.opacity}
                pathLength={1}
                strokeDasharray={`${layer.length} ${1 - layer.length}`}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from={`${-start}`}
                  to={`${-(start + 1)}`}
                  dur={`${LOOP_DURATION}s`}
                  repeatCount="indefinite"
                />
              </path>
            );
          })
        )}
      </g>
    </svg>
  );
}

function TracePath({
  d,
  reducedMotion,
}: {
  d: string;
  reducedMotion: boolean;
}) {
  const initialPathLength = reducedMotion ? 1 : 0;

  return (
    <>
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="60"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        initial={{
          pathLength: initialPathLength,
          opacity: reducedMotion ? 0.2 : 0,
        }}
        animate={{ pathLength: 1, opacity: 0.2 }}
        transition={{
          pathLength: { duration: 2.5, ease: "easeInOut", delay: 0.4 },
          opacity: { duration: 0.3, delay: 0.4 },
        }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        initial={{
          pathLength: initialPathLength,
          opacity: reducedMotion ? 0.8 : 0,
        }}
        animate={{ pathLength: 1, opacity: 0.8 }}
        transition={{
          pathLength: { duration: 2.5, ease: "easeInOut", delay: 0.55 },
          opacity: { duration: 0.3, delay: 0.55 },
        }}
      />
    </>
  );
}
