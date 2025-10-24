"use client";
import { ColorShift } from "@/components/ColorShift";
import Footer from "@/components/Footer";
import { Geist } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const F1T_SRC =
  "https://res.cloudinary.com/dvukvnmqt/image/upload/v1759788318/f1telemetry_1_msrjwa.png";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const boldGeist = Geist({ subsets: ["latin"], weight: "800" });

interface HomeContentProps {
  dict: any;
}

export default function HomeContent({ dict }: HomeContentProps) {
  const [isVisible, setIsVisible] = useState(false);

  const map_mp4 = process.env.NEXT_PUBLIC_MAPS_MP4 || "";
  const circles_mp4 = process.env.NEXT_PUBLIC_CIRCLES_MP4 || "";
  const audio_mp4 = process.env.NEXT_PUBLIC_AUDIO_MP4 || "";
  const discord = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "";
  const github = process.env.NEXT_PUBLIC_GITHUB_URL || "";

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
    <div className="min-h-screen bg-warmBlack px-[15%]">
      <header
        className={`
        fixed top-0 left-0 w-full gap-4 md:px-[15%] h-[5rem] z-50 
        backdrop-blur-sm shadow-md 
        transition-transform duration-300 ease-in-out bg-gradient-to-br from-warmBlack to-warmBlack2 
        ${isVisible ? "translate-y-0" : "-translate-y-full"}
      `}
      >
        <div className="flex justify-between items-center mx-auto px-4 py-3">
          {/* Elemento 1: Logo o Título */}
          <Image
            src={F1T_SRC}
            width={50}
            height={50}
            alt="Telemetría telemetria Formula 1"
          />

          {/* Elemento 2: Navegación o Botón */}
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
      <div className="flex flex-col gap-[5rem] py-[2rem] justify-center items-center">
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
          <div className="w-full flex justify-center">
            <video
              src={map_mp4}
              loop
              autoPlay
              muted
              className="md:max-h-[20rem]"
            />
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
            {dict.home.goalTitle}
          </h5>
          <span className="text-md text-gray-400 text-center">
            {dict.home.goalDesc1}{" "}
            <a
              href={discord}
              className="bold text-gray-200 relative inline-block transition-all duration-300 hover:text-white group"
              target="_blank"
            >
              <span className="relative z-10">{dict.home.goalDesc2}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-offWhite transition-all duration-500 group-hover:w-full"></span>
            </a>
          </span>
        </div>
        <div
          className="flex flex-col pb-[3rem] gap-4 items-center text-center w-full h-full"
          style={mediumGeist.style}
        >
          <h5 className="text-xl text-gray-200 ">{dict.home.repoTitle}</h5>
          <div className="flex flex-col gap-0">
            <span className="text-md text-gray-400 text-center items-center">
              {dict.home.repoDesc1}{" "}
              <a
              href={discord}
              className="bold text-gray-200 relative inline-block transition-all duration-300 hover:text-white group"
              target="_blank"
            >
              <span className="relative z-10">{dict.home.repoDesc2}</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-offWhite transition-all duration-500 group-hover:w-full"></span>
            </a>
            </span>
            <span className="bold text-gray-400">{dict.home.repoDesc3}</span>
            <span>{dict.home.repoDesc4}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
