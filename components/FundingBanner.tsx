"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { Button } from "@/components/ui/button";

interface FundingBannerProps {
  dict: any;
}

interface FundingStatus {
  costUsd: number;
  donatedUsd: number;
}

export default function FundingBanner({ dict }: FundingBannerProps) {
  const [status, setStatus] = useState<FundingStatus | null>(null);
  const [fading, setFading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const apiUrl = config.public.apiUrl;
    if (!apiUrl) return;

    let cancelled = false;

    fetch(new URL("config/funding", apiUrl).toString())
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.success) {
          setStatus({ costUsd: data.costUsd, donatedUsd: data.donatedUsd });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const funded = !!status && status.donatedUsd >= status.costUsd;

  useEffect(() => {
    // Let the thank-you message be seen once, then fade out rather than
    // snapping away, so it doesn't linger over the header once covered.
    if (!funded) return;

    const id = setTimeout(() => setFading(true), 10_000);
    return () => clearTimeout(id);
  }, [funded]);

  // Not configured yet, or fetch failed/pending: render nothing rather than
  // a placeholder, same fallback approach as the Discord invite link.
  if (!status || status.costUsd <= 0 || dismissed) return null;

  const pct = Math.min(
    100,
    Math.round((status.donatedUsd / status.costUsd) * 100),
  );

  return (
    <div
      className={`flex flex-col items-center gap-1 text-xs font-inter text-offWhite max-w-[20rem] transition-opacity duration-1000 ease-out ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      onTransitionEnd={() => {
        if (fading) setDismissed(true);
      }}
    >
      <div className="flex items-center gap-2 w-full min-w-[8rem]">
        <span className="whitespace-nowrap font-inter">
          ${status.donatedUsd.toFixed(0)}
        </span>
        <div className="flex-1 h-1.5 min-w-[4rem] bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-f1Blue rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="whitespace-nowrap font-inter">
           ${status.costUsd.toFixed(0)}
        </span>
      </div>
      {funded ? (
        <span className="text-gray-400 text-center">{dict.funding.thanks}</span>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-center">
            {dict.funding.description}
          </span>
          <a href={dict.donate.url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs bg-f1Blue/10 text-f1Blue hover:bg-f1Blue/20 hover:text-offWhite border-f1Blue border-1">
              {dict.funding.cta}
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}
