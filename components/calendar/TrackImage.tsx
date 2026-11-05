"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { TrackAsset } from "@/utils/track-assets";

interface TrackImageProps {
  asset: TrackAsset;
  className?: string;
}

export default function TrackImage({ asset, className }: TrackImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <img
      src={asset.src}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        className,
        asset.format === "svg" && "invert",
      )}
    />
  );
}
