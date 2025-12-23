"use client";
import Image from "next/image";
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
}: HeaderNavProps) {
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

  const leftBtnClass = `rounded px-3 py-3 text-sm bg-white text-black border-2 border-white text-center transition duration-300 ease-in-out 
                font-geist font-medium
                hover:shadow-2xl 
                hover:text-gray-200
                hover:cursor-pointer
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50 ${leftColorClasses}`;

  const rightBtnClass = `rounded w-full py-3 px-3 text-sm bg-transparent border-2 border-gray-200 text-gray-200 text-center transition duration-300 ease-in-out 
                font-geist font-medium
                hover:text-gray-200
                hover:cursor-pointer
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50 ${rightColorClasses}`;

  return (
    <header
      className={`
        fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 
        backdrop-blur-sm shadow-md 
        transition-transform duration-300 ease-in-out bg-warmBlack 
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="flex justify-between items-center mx-auto px-4 h-full">
        <Image
          src={f1t_url}
          width={80}
          height={80}
          alt="Telemetría telemetria telemetrics Formula 1 F1 Telemetry logo"
        />
        <nav className="flex flex-row gap-2 items-center justify-center">
          <a className={leftBtnClass} href={leftUrl}>
            {leftTitle}
          </a>
          <a className={rightBtnClass} href={rightUrl}>
            {rightTitle}
          </a>
        </nav>
      </div>
    </header>
  );
}
