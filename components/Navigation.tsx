"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";
import { config } from "@/lib/config";
import { useAuth } from "@/hooks/use-auth";
import AuthForm from "@/components/telemetry/AuthForm";

export interface NavigationProps {
  dict: any;
  locale?: string;
  maxScrollPosition?: number;
  logoUrl?: string;
}

export default function Navigation({
  dict,
  locale: localeOverride,
  maxScrollPosition,
  logoUrl = config.public.assets.f1_white,
}: NavigationProps) {
  const pathname = usePathname();
  const locale = localeOverride ?? dict?.locale ?? "es";
  const { user, isAuthenticated, logout } = useAuth();

  const isScheduleRoute = pathname.includes("/schedule");
  const isReplayRoute = pathname.includes("/replay");
  const isHomeRoute =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname === "/" ||
    pathname.split("/").filter(Boolean).length === 1;
  const isLiveTimingRoute = pathname.includes("/live-timing");

  const hasScrollTrigger =
    typeof maxScrollPosition === "number" && maxScrollPosition > 0;
  const [isVisible, setIsVisible] = useState(!hasScrollTrigger);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [authFormOpen, setAuthFormOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountMenuOpen]);

  useEffect(() => {
    if (isAuthenticated) setAccountMenuOpen(false);
  }, [isAuthenticated]);

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
    <>
      <header
        className={`fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 backdrop-blur-sm shadow-md transition-transform duration-300 ease-in-out bg-warmBlack ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
      <div className="flex justify-between items-center mx-auto gap-4 px-4 h-full max-[400px]:gap-2 max-[400px]:px-2">
        <div className="flex shrink-0 items-center gap-2">
          <div className="relative" ref={accountMenuRef}>
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthFormOpen(true);
                  return;
                }
                setAccountMenuOpen((open) => !open);
              }}
              aria-label={dict.auth?.account ?? "Account"}
              aria-expanded={isAuthenticated ? accountMenuOpen : undefined}
              aria-haspopup={isAuthenticated ? "menu" : undefined}
              className="flex h-10 w-10 items-center justify-center text-offWhite focus:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
            >
              <User size={20} aria-hidden="true" />
            </button>
            {accountMenuOpen && (
              <div
                role="menu"
                aria-label={dict.auth?.account ?? "Account"}
                className="absolute left-0 top-full z-[60] mt-2 min-w-52 rounded border border-gray-700 bg-warmBlack p-2 shadow-xl"
              >
                {isAuthenticated ? (
                  <>
                    <p className="px-3 py-2 text-xs text-gray-400">
                      {dict.auth?.signedInAs ?? "Signed in as"}{" "}
                      <span className="font-medium text-white">
                        {user?.username}
                      </span>
                    </p>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                      className="flex w-full items-center text-xs gap-2 rounded px-3 py-2 text-left text-sm text-gray-400 hover:text-f1Blue focus:outline-none focus-visible:ring-2 focus-visible:ring-f1Blue"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      {dict.auth?.logout ?? "Sign out"}
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>
          <Link href={`/${locale}`} className="shrink-0">
            <Image
              src={logoUrl}
              width={80}
              height={80}
              alt="F1 Telemetry"
              className="h-16 w-16 shrink-0 object-contain"
            />
          </Link>
        </div>
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
          {!isReplayRoute && (
            <Link
              href={`/${locale}/replay`}
              className={`${baseBtnClass} bg-transparent border-2 border-gray text-offWhite hover:bg-f1Green hover:border-f1Green`}
            >
              {dict.replay?.title ?? "Replay"}
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
      <AuthForm
        isOpen={authFormOpen}
        onClose={() => setAuthFormOpen(false)}
        dict={dict}
      />
    </>
  );
}
