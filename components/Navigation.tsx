"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { config } from "@/lib/config";

export interface NavigationProps {
  dict: any;
  maxScrollPosition?: number;
  logoUrl?: string;
}

export default function Navigation({
  dict,
  maxScrollPosition,
  logoUrl = config.public.assets.f1_white,
}: NavigationProps) {
  const pathname = usePathname();
  const locale = dict?.locale ?? "es";

  const isScheduleRoute = pathname.includes("/schedule");
  const isHomeRoute =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname === "/" ||
    pathname.split("/").filter(Boolean).length === 1;
  const isLiveTimingRoute = pathname.includes("/live-timing");

  const hasScrollTrigger =
    typeof maxScrollPosition === "number" && maxScrollPosition > 0;
  const [isVisible, setIsVisible] = useState(!hasScrollTrigger);

  useEffect(() => {
    if (!hasScrollTrigger) return;

    const handleScroll = () => {
      setIsVisible(window.scrollY >= maxScrollPosition);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrollTrigger, maxScrollPosition]);

  const baseBtnClass =
    "flex flex-none items-center justify-center truncate rounded py-2 px-2 md:py-3 md:px-3 text-xs md:text-sm text-center transition duration-300 ease-in-out font-geist font-medium focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50";

  return (
    <header
      className={`fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 backdrop-blur-sm shadow-md transition-transform duration-300 ease-in-out bg-warmBlack ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex justify-between items-center mx-auto gap-4 px-4 h-full max-[400px]:gap-2 max-[400px]:px-2">
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src={logoUrl}
            width={80}
            height={80}
            alt="F1 Telemetry"
            className="h-16 w-16 shrink-0 object-contain"
          />
        </Link>
        <nav
          aria-label="Navegación principal"
          className="flex flex-row gap-2 items-center justify-center"
        >
          {!isLiveTimingRoute && (
            <Link
              href={`/${locale}/live-timing`}
              className={`${baseBtnClass} bg-white text-black border-2 border-white hover:shadow-2xl hover:text-offWhite hover:bg-f1Blue hover:border-f1Blue`}
            >
              {dict.home?.dashboardButton ??
                dict.schedule?.dashboardButton ??
                "Telemetría"}
            </Link>
          )}
          {!isScheduleRoute && (
            <Link
              href={`/${locale}/schedule`}
              className={`${baseBtnClass} bg-transparent border-2 border-gray text-offWhite hover:bg-f1Red hover:border-f1Red`}
            >
              {dict.home?.scheduleButton ??
                dict.schedule?.title ??
                "Calendario"}
            </Link>
          )}
          {!isHomeRoute && (
            <Link
              href={`/${locale}`}
              className={`${baseBtnClass} bg-transparent border-2 border-gray text-offWhite hover:bg-f1Purple hover:border-f1Purple`}
            >
              {dict.schedule?.homeButton ?? "Inicio"}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
