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

  const map_mp4 = config.public.blobBaseUrl + "/mp4/livemap.mp4";
  const circles_mp4 = config.public.blobBaseUrl + "/mp4/circles.mp4";
  const audio_mp4 = config.public.blobBaseUrl + "/mp4/audios.mkv";

  const f1t = config.public.blobBaseUrl + "/f1t.png";

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
    <div className="min-h-screen bg-warmBlack max-w-4xl mx-auto px-4">
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
      <div className="flex flex-col gap-[5rem] py-[2rem] justify-center items-center w-full ">
        <div className="flex flex-col min-h-screen justify-evenly gap-[5rem]">
          <div className="flex flex-col md:flex-row w-full h-full justify-around gap-8">
            <div className="flex flex-col md:max-w-[25rem] items-center justify-center text-gray-200 gap-[2rem]  ">
              <h1
                className="text-[2rem] text-gray-200 boldest "
                style={boldGeist.style}
              >
                {Array.from("F1Telemetry").map((char, idx) => {
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
                          ? "#b197fc"
                          : "#51cf66"
                      }
                    />
                  );
                })}{" "}
                | {dict.home.title}
              </h1>
              <h2 className="text-md text-gray-300" style={mediumGeist.style}>
                {dict.home.description}
              </h2>
            </div>
            <div className="flex flex-col gap-8 items-center justify-center">
              <a
                className="rounded px-6 py-3 text-[1.5rem] bg-white text-black text-center transition duration-300 ease-in-out 
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
                className="rounded px-6 md:w-full py-3 text-[1.5rem] bg-transparent border-2 border-gray-200 text-gray-200 text-center transition duration-300 ease-in-out 
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
          <div className="w-full flex justify-center relative">
            <a
              href="/live-map"
              className="inset-0 flex items-center justify-center"
              style={mediumGeist.style}
            >
              <video
                src={map_mp4}
                loop
                autoPlay
                muted
                className="md:max-h-[20rem]"
              />
            </a>
          </div>
          <div className="flex flex-col md:flex-row gap-[2rem] md:justify-evenly w-full h-full px-[5%]">
            <div
              className="flex flex-col md:flex-row gap-[2rem] items-center"
              style={mediumGeist.style}
            >
              <div className="flex flex-col gap-4 w-full max-w-[30rem]">
                <h5 className="text-xl text-gray-200 ">
                  {dict.home.audioTitle}
                </h5>
                <span className="text-md text-gray-400 text-start">
                  {dict.home.audioDesc1}
                  <span className="bold text-gray-200">
                    {dict.home.audioDesc2}
                  </span>
                </span>
              </div>
              <video
                src={audio_mp4}
                loop
                autoPlay
                muted
                className="w-[20rem]"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-[2rem] md:justify-evenly w-full h-full px-[5%]">
            <div
              className="flex flex-col md:flex-row gap-[2rem] items-center"
              style={mediumGeist.style}
            >
              <div className="flex flex-col gap-4 w-full max-w-[30rem]">
                <h5 className="text-xl text-gray-200 ">
                  {dict.home.circlesTitle}
                </h5>
                <span className="text-md text-gray-400 text-start">
                  {dict.home.circlesDesc1}
                  <span className="bold text-gray-200">
                    {" "}
                    {dict.home.circlesDesc2}
                  </span>
                  {dict.home.circlesDesc3}
                </span>
              </div>
              <video
                src={circles_mp4}
                loop
                autoPlay
                muted
                className="w-[20rem]"
              />
            </div>
          </div>
        </div>
        <div
          className="flex flex-col gap-4 md:max-w-[70%]"
          style={mediumGeist.style}
        >
          <h5 className="text-xl text-gray-200 text-center">
            {dict.home.repoTitle}
          </h5>
          <div className="flex flex-col gap-0 text-center items-center">
            <span className="text-md text-gray-400 text-center items-center">
              {dict.home.repoDesc1}{" "}
              <a
                href={config.public.github}
                className="bold text-gray-200 relative inline-block transition-all duration-300 hover:text-white group"
                target="_blank"
              >
                <span className="relative z-10">{dict.home.repoDesc2}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-offWhite transition-all duration-500 group-hover:w-full"></span>
              </a>{" "}
              <span className="text-md text-gray-400 text-center">
                {dict.home.goalDesc1}{" "}
                <a
                  href={config.public.discord}
                  className="bold text-gray-200 relative inline-block transition-all duration-300 hover:text-white group"
                  target="_blank"
                >
                  <span className="relative z-10">{dict.home.goalDesc2}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-offWhite transition-all duration-500 group-hover:w-full"></span>
                </a>
              </span>
              <span>{dict.home.repoDesc4}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
