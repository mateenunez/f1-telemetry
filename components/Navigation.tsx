"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

type HeaderNavProps = {
  leftUrl: string;
  rightUrl: string;
  leftTitle: string;
  rightTitle: string;
  leftColor?: string;
  rightColor?: string;
  f1t_url: string;
  maxScrollPosition?: number;
  prodeUrl?: string;
  prodeTitle?: string;
  prodeColor?: string;
  homeUrl: string;
  homeTitle: string;
  scheduleUrl: string;
  scheduleTitle: string;
};

export default function Navigation({
  leftUrl,
  rightUrl,
  leftTitle,
  rightTitle,
  leftColor = "f1Blue",
  rightColor = "f1Red",
  f1t_url,
  maxScrollPosition = 0,
  prodeUrl,
  prodeTitle,
  prodeColor = "f1Yellow",
  homeUrl,
  homeTitle,
  scheduleUrl,
  scheduleTitle,
}: HeaderNavProps) {
  const pathname = usePathname();
  const isProdeRoute = pathname.split("/").includes("prode");
  const isScheduleRoute = pathname.endsWith("/schedule");
  const isHomeRoute = pathname.split("/").filter(Boolean).length === 1;
  const [isVisible, setIsVisible] = useState(false);
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition >= maxScrollPosition) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Mapa con clases estáticas para que Tailwind las detecte en tiempo de compilación
  const COLOR_MAP: Record<string, string> = {
    f1Blue: "hover:bg-f1Blue hover:border-f1Blue",
    f1Red: "hover:bg-f1Red hover:border-f1Red",
    f1Yellow: "hover:bg-f1Yellow hover:border-f1Yellow",
    f1Purple: "hover:bg-f1Purple hover:border-f1Purple",
    // añadir más colores si hace falta
  };

  const leftColorClasses = COLOR_MAP[leftColor] ?? COLOR_MAP.f1Blue;
  const rightColorClasses = COLOR_MAP[rightColor] ?? COLOR_MAP.f1Red;
  const homeColorClasses = COLOR_MAP.f1Purple;
  const prodeColorClasses = COLOR_MAP[prodeColor] ?? COLOR_MAP.f1Yellow;
  const prodeBtnClass = `flex flex-none items-center justify-center truncate rounded py-2 px-2 md:py-3 md:px-3 text-xs md:text-sm bg-transparent border-2 border-f1Yellow text-f1Yellow text-center transition duration-300 ease-in-out                 font-geist font-medium
                hover:bg-f1Yellow hover:border-f1Yellow hover:text-warmBlack
                hover:shadow-2xl
                hover:cursor-pointer
                focus:outline-none
                focus:ring-4
                focus:ring-f1Yellow/40`;

  const leftBtnClass = `flex flex-none items-center justify-center truncate rounded py-2 px-2 md:py-3 md:px-3 text-xs md:text-sm bg-white text-black border-2 border-white text-center transition duration-300 ease-in-out
                font-geist font-medium
                hover:shadow-2xl 
                hover:text-offWhite
                hover:cursor-pointer
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50 ${leftColorClasses}`;

  const rightBtnClass = `flex flex-none items-center justify-center truncate rounded py-2 px-2 md:py-3 md:px-3 text-xs md:text-sm bg-transparent border-2 border-gray text-offWhite text-center transition duration-300 ease-in-out
                font-geist font-medium
                hover:text-offWhite
                hover:cursor-pointer
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50 ${rightColorClasses}`;
  const homeBtnClass = rightBtnClass.replace(
    rightColorClasses,
    homeColorClasses,
  );

  return (
    <header
      className={`
        fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 
        backdrop-blur-sm shadow-md 
        transition-transform duration-300 ease-in-out bg-warmBlack 
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="flex justify-between items-center mx-auto gap-4 px-4 h-full max-[400px]:gap-2 max-[400px]:px-2">
        <Image
          src={f1t_url}
          width={80}
          height={80}
          alt="Telemetría telemetria telemetrics Formula 1 F1 Telemetry logo"
          className="h-16 w-16 shrink-0 object-contain"
        />
        <nav className="flex flex-row gap-2 items-center justify-center">
          <a className={leftBtnClass} href={leftUrl}>
            {leftTitle}
          </a>
          {!isScheduleRoute && (
            <a className={rightBtnClass} href={scheduleUrl}>
              {scheduleTitle}
            </a>
          )}
          {!isProdeRoute && prodeUrl && prodeTitle && (
            <a
              className={`${prodeBtnClass} ${prodeColorClasses}`}
              href={prodeUrl}
            >
              {prodeTitle}
            </a>
          )}
          {!isHomeRoute && (
            <a className={homeBtnClass} href={homeUrl}>
              {homeTitle}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
