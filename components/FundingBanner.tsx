"use client";

import { useEffect, useState } from "react";
import { config } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
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
  const [entered, setEntered] = useState(false);
  const [fading, setFading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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
    // Fade the whole banner in once it has something to show, rather than
    // popping in the instant the fetch resolves.
    if (!status) return;

    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [status]);

  useEffect(() => {
    // Let the thank-you message be seen once, then fade out rather than
    // snapping away, so it doesn't linger over the header once covered.
    if (!funded) return;

    const id = setTimeout(() => setFading(true), 10_000);
    return () => clearTimeout(id);
  }, [funded]);

  useEffect(() => {
    // Collapse the progress bar down to just the text/button row after a
    // few seconds so the ask doesn't linger over the header on every visit.
    if (funded) return;

    const id = setTimeout(() => setCollapsed(true), 10_000);
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
      className={`flex flex-col items-center text-xs font-inter text-offWhite max-w-[20rem] transition-opacity duration-700 ease-out ${
        entered && !fading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onTransitionEnd={() => {
        if (fading) setDismissed(true);
      }}
    >
      {funded ? (
        <>
          <div className="flex items-center gap-2 w-full min-w-[8rem] mb-1">
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
          <span className="text-gray-400 text-center">{dict.funding.thanks}</span>
        </>
      ) : (
        <>
          <div
            className={`flex items-center gap-2 w-full min-w-[8rem] overflow-hidden transition-all duration-700 ease-out ${
              collapsed ? "max-h-0 opacity-0 mb-0" : "max-h-8 opacity-100 mb-1"
            }`}
          >
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
          <div className="flex items-center">
            <span
              className={`text-gray-400 text-center overflow-hidden transition-all duration-700 ease-out ${
                collapsed ? "max-w-0 opacity-0 overflow-hidden whitespace-nowrap" : "max-w-[13rem] opacity-100"
              }`}
            >
              {dict.funding.description}
            </span>
            <a
              href={dict.donate.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("donate_click", { location: "header" })}
            >
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-f1Blue/10 text-f1Blue hover:bg-f1Blue/20 hover:text-offWhite border-f1Blue border-1"
              >
                {dict.funding.cta}
              </Button>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
