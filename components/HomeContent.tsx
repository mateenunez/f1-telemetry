"use client";
import { ColorShift } from "@/components/ColorShift";
import Image from "next/image";
import { useEffect, useState } from "react";
import { config } from "@/lib/config";

interface HomeContentProps {
  dict: any;
}

export default function HomeContent({ dict }: HomeContentProps) {
  const [isVisible, setIsVisible] = useState(false);

  type InlineVideoCardProps = {
    title: string;
    description: string;
    videoUrl: string;
  };

  const InlineVideoCard = ({
    title,
    description,
    videoUrl,
  }: InlineVideoCardProps) => (
    <div className="md:w-[25rem] w-full flex flex-col items-center px-1">
      <div className="rounded-xl border-2 border-gray-400 bg-transparent p-4">
        <h3 className="text-center text-lg mb-3 text-gray-200 font-orbitron">
          {title}
        </h3>
        <div className="w-full overflow-hidden rounded-lg">
          <video
            src={videoUrl}
            loop
            autoPlay
            muted
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-300 text-center px-2 font-geist font-medium">
        {description}
      </p>
    </div>
  );

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
        <div className="flex justify-between items-center mx-auto px-4 h-full">
          <Image
            src={f1t}
            width={80}
            height={80}
            alt="Telemetría telemetria telemetrics Formula 1 F1 Telemetry logo"
          />
          <nav className="flex flex-row gap-2 items-center justify-center">
            <a
              className="rounded px-3 py-3 text-sm bg-white text-black border-2 border-white text-center transition duration-300 ease-in-out 
                font-geist font-medium
                hover:bg-f1Blue
                hover:shadow-2xl 
                hover:text-gray-200
                hover:cursor-pointer
                hover:border-f1Blue
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              href="/live-timing"
            >
              {dict.home.dashboardButton}
            </a>
            <a
              className="rounded w-full py-3 px-3 text-sm bg-transparent border-2 border-gray-200 text-gray-200 text-center transition duration-300 ease-in-out 
                font-geist font-medium
                hover:bg-f1Red
                hover:text-gray-200
                hover:border-f1Red
                hover:cursor-pointer
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
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
            <p className="text-gray-300 text-sm text-center px-2 font-geist font-medium">
              {dict.home.version}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={config.public.assets.f1t_black}
              height={150}
              width={250}
              alt="F1 Telemetry black logo"
            />
            <h1 className="text-[2rem] text-gray-200 font-geist font-extrabold">
              {Array.from(dict.home.title).map((char, idx) => {
                if (typeof char !== "string") return;
                return (
                  <ColorShift
                    key={idx}
                    text={char}
                    animateLetters={true}
                    letterDelay={150 * idx}
                    letterColor={
                      idx < 3
                        ? "#3B82F6"
                        : idx > 2 && idx < 6
                        ? "#ffe066"
                        : idx > 9
                        ? "#A855F7"
                        : "#51cf66"
                    }
                  />
                );
              })}
            </h1>
          </div>
          <div className="flex md:flex-row flex-col justify-center items-center md:gap-[4rem] gap-[2rem] w-full">
            <a
              className="rounded px-6 w-[15rem] py-3 text-[1.5rem] bg-white text-black text-center transition duration-300 ease-in-out 
                hover:-translate-y-1 
                hover:scale-105 
                hover:bg-f1Blue 
                hover:shadow-2xl 
                hover:text-gray-200
                hover:cursor-pointer
                font-geist font-medium
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
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
                font-geist font-medium
                
                focus:outline-none 
                focus:ring-4 
                focus:ring-gray-500 
                focus:ring-opacity-50"
              href="/schedule"
            >
              {dict.home.scheduleButton}
            </a>
          </div>
        </div>
      </div>
      <div className="py-5 w-full bg-warmBlack">
        <div className="flex flex-col justify-evenly min-h-screen h-full gap-[2rem] justify-center items-center max-w-4xl mx-auto">
          <div>
            <h2 className="text-md text-gray-300 text-center font-geist font-medium">
              {dict.home.description}
            </h2>
          </div>
          <div className="flex flex-col gap-[5rem] md:flex-row justify-evenly">
            <InlineVideoCard
              title={dict.home.mapTitle}
              description={dict.home.mapDesc}
              videoUrl={config.public.assets.mp4.livemap}
            />
            <InlineVideoCard
              title={dict.home.audioTitle}
              description={dict.home.audioDesc}
              videoUrl={config.public.assets.mp4.audios}
            />
            <InlineVideoCard
              title={dict.home.circlesTitle}
              description={dict.home.circlesDesc}
              videoUrl={config.public.assets.mp4.circles}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
