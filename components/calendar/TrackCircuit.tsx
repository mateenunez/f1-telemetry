"use client";

import AnimatedCircuit, {
  type CircuitAnimation,
} from "@/components/calendar/AnimatedCircuit";
import TrackImage from "@/components/calendar/TrackImage";
import type { TrackAsset } from "@/utils/track-assets";

export type TrackCircuitVariant = CircuitAnimation | "image";

interface TrackCircuitProps {
  asset: TrackAsset;
  variant?: TrackCircuitVariant;
  className?: string;
}

/**
 * Renders any circuit asset, regardless of format or Grand Prix.
 * SVG assets can be animated; raster assets are rendered as plain images.
 */
export default function TrackCircuit({
  asset,
  variant = "image",
  className,
}: TrackCircuitProps) {
  if (asset.format === "svg" && variant !== "image") {
    return (
      <AnimatedCircuit
        src={asset.src}
        animation={variant}
        className={className}
      />
    );
  }

  return <TrackImage asset={asset} className={className} />;
}
