"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CircuitData {
  d: string;
  viewBox: string;
  transform?: string;
}

interface AnimatedCircuitProps {
  src: string;
  className?: string;
}

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
}: AnimatedCircuitProps) {
  const [circuit, setCircuit] = useState<CircuitData | null>(null);

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
        <motion.path
          d={circuit.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="70"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{
            pathLength: { duration: 2.5, ease: "easeInOut" },
            opacity: { duration: 0.3, delay: 0.4 },
          }}
        />
        <motion.path
          d={circuit.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="30"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{
            pathLength: { duration: 2.5, ease: "easeInOut" },
            opacity: { duration: 0.3, delay: 0.55 },
          }}
        />
      </g>
    </svg>
  );
}
