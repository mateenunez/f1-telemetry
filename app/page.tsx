"use client";
import { ColorShift } from "@/components/ColorShift";
import Footer from "@/components/Footer";
import { Geist, Orbitron } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";

const F1T_SRC =
  "https://res.cloudinary.com/dvukvnmqt/image/upload/v1759788318/f1telemetry_1_msrjwa.png";

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });
const boldGeist = Geist({ subsets: ["latin"], weight: "800" });

export default function Page() {
  const [isVisible, setIsVisible] = useState(false);

  const map_mp4 = process.env.NEXT_PUBLIC_MAPS_MP4 || "";
  const cod_mp4 = process.env.NEXT_PUBLIC_COD_MP4 || "";
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
        <div className="flex justify-between items-center  mx-auto px-4 py-3">
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
              Dashboard
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
              Schedule
            </a>
          </nav>
        </div>
      </header>
      <div className="flex flex-col">
        <div className="flex flex-col min-h-screen justify-evenly py-[5rem] md:py-0">
          <div className="flex flex-col md:flex-row w-full h-full justify-around">
            <div className="flex flex-col gap-4 md:w-[50%] md:max-w-[25rem] items-center justify-center text-gray-200">
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
                | Real time dashboard and analytics
              </h1>
              <h2 className="text-md text-gray-300" style={mediumGeist.style}>
                Get into a immersive experience watching Formula 1 real time
                data as laps, sectors, minisectors, circuit and audios from race
                warnings or team radios.
              </h2>
            </div>
            <div className="flex flex-col gap-8 items-center justify-center h-[20rem]">
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
                Dashboard
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
                Schedule
              </a>
            </div>
          </div>
          <div className="w-full h-[20rem] items center flex flex-col-reverse md:flex-row justify-center mb-[2rem]">
            <video src={cod_mp4} width="400" loop autoPlay muted />
            <video src={map_mp4} width="600" loop autoPlay muted />
          </div>
          <div className="flex flex-col md:flex-row gap-8 md:justify-evenly w-full h-full px-[5%]">
            <div
              className="flex flex-col gap-4 max-w-[25rem]"
              style={mediumGeist.style}
            >
              <h5 className="text-xl text-gray-200 ">Who are we?</h5>
              <span className="text-md text-gray-400 text-start">
                This was made by some students from latam. We wanted to face a
                challenge that combines the information system engineering with
                UX/UI, and...we've
                <span className="bold text-gray-200"> learned a lot!</span>
              </span>
            </div>
            <div
              className="flex flex-col gap-4 max-w-[25rem]"
              style={mediumGeist.style}
            >
              <h5 className="text-xl text-gray-200 ">What is our goal?</h5>
              <span className="text-md text-gray-400 text-start">
                Our goal is to attempt and display all analytics and data
                possible, giving you the best experience at watching the race.
                This is only possible with your very important feedback and
                ideas, so please{" "}
                <a
                  href={discord}
                  className="bold text-gray-200"
                  target="_blank"
                >
                  reach us on our discord server!
                </a>
              </span>
            </div>
          </div>
        </div>
        <div
          className="flex flex-col pb-[3rem] md:py-[3rem] gap-4 items-center text-center w-full h-full"
          style={mediumGeist.style}
        >
          <h5 className="text-xl text-gray-200 ">
            To developers and designers
          </h5>
          <div className="flex flex-col gap-0">
            <span className="text-md text-gray-400 text-start items-center">
              If you have any features ideas or critics you are happily invited
              to contribute on this{" "}
              <a href={github} className="bold text-gray-200" target="_blank">
                github repository.
              </a>
            </span>
            <span className="bold text-gray-400">
              This project will always be free and open source.
            </span>
            <span>🥥🏁</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
