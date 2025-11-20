"use client";
import { ColorShift } from "@/components/ColorShift";
import { Geist } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { config } from "@/lib/config";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const boldGeist = Geist({ subsets: ["latin"], weight: "800" });

interface HomeContentProps {
  dict: any;
}

export default function HomeContent({ dict }: HomeContentProps) {
  const [isVisible, setIsVisible] = useState(false);

  const mapMp4 = config.public.assets.mp4.livemap;
  const circlesMp4 = config.public.assets.mp4.circles;
  const audioMp4 = config.public.assets.mp4.audios;

  const f1t = config.public.assets.f1t;

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 100) {
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

  return (
    <div className="min-h-screen w-full">
      <header
        className={`
        fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 
        backdrop-blur-sm shadow-md 
        transition-transform duration-300 ease-in-out bg-gradient-to-br from-warmBlack to-warmBlack2 
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
      >
        <div className="flex justify-between items-center mx-auto px-4 py-3">
          <Image
            src={f1t}
            width={50}
            height={50}
            alt="Telemetría telemetria Formula 1"
          />
          <nav className="flex flex-row gap-2">
            <a
              className="rounded px-3 py-3 text-sm bg-white text-black text-center transition duration-300 ease-in-out 
                
                hover:bg-f1Blue
                hover:shadow-2xl 
                hover:text-gray-200
                hover:cursor-pointer
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              style={mediumGeist.style}
              href="/live-timing"
            >
              {dict.home.dashboardButton}
            </a>
            <a
              className="rounded w-full py-3 px-3 text-sm bg-transparent border-2 border-gray-200 text-gray-200 text-center transition duration-300 ease-in-out 
             
                hover:bg-f1Red
                hover:text-gray-200
                hover:border-f1Red
                hover:cursor-pointer
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              style={mediumGeist.style}
              href="/schedule"
            >
              {dict.home.scheduleButton}
            </a>
          </nav>
        </div>
      </header>
      <div className="h-screen py-5 w-full bg-f1telemetry bg-cover bg-center">
        <div className="flex flex-col justify-evenly h-full justify-center items-center max-w-4xl mx-auto">
          <div className="flex justify-center w-full items-center">
            <p className="text-gray-300 text-sm" style={mediumGeist.style}>
              La version 1.4.2 contiene cambios de delay dinamico, tutorial
              interactivo y cambios en la UI!
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={config.public.assets.f1t_black}
              height={150}
              width={250}
              alt="F1 Telemetry black logo"
            />
            <h1
              className="text-[2rem] text-gray-200 boldest "
              style={boldGeist.style}
            >
              {dict.home.title}
            </h1>
          </div>
          <div className="flex md:flex-row flex-col justify-center gap-[4rem] w-full">
            <a
              className="rounded px-6 w-[15rem] py-3 text-[1.5rem] bg-white text-black text-center transition duration-300 ease-in-out 
                hover:-translate-y-1 
                hover:scale-105 
                hover:bg-f1Blue 
                hover:shadow-2xl 
                hover:text-gray-200
                hover:cursor-pointer
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              style={mediumGeist.style}
              href="/live-timing"
            >
              {dict.home.dashboardButton}
            </a>
            <a
              className="rounded px-6 w-[15rem] py-3 text-[1.5rem] bg-transparent border-2 border-gray-200 text-gray-200 text-center transition duration-300 ease-in-out 
                hover:-translate-y-1 
                hover:scale-105 
                hover:bg-f1Red
                hover:shadow-2xl 
                hover:text-gray-200
                hover:border-none
                hover:cursor-pointer
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              style={mediumGeist.style}
              href="/schedule"
            >
              {dict.home.scheduleButton}
            </a>
          </div>
        </div>
      </div>
      <div className="py-5 w-full bg-warmBlack">
        <div className="flex flex-col justify-evenly h-full justify-center items-center max-w-4xl mx-auto">
          <div>
            <h2 className="text-md text-gray-300 text-center" style={mediumGeist.style}>
              {dict.home.description}
            </h2>
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}
