"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function PageEntrance({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const isHomePage = pathSegments.length <= 1;
  const isTelemetryDashboard = pathSegments.includes("live-timing");
  const shouldAnimatePage = !isHomePage && !isTelemetryDashboard;

  return (
    <div className={shouldAnimatePage ? "page-enter" : undefined}>
      {children}
    </div>
  );
}
