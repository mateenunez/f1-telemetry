"use client";
import { ColorShift } from "@/components/home/ColorShift";
import Image from "next/image";
import { config } from "@/lib/config";
import Navigation from "../Navigation";

interface HomeContentProps {
  dict: any;
}

export default function HomeContent({ dict }: HomeContentProps) {
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

  return (
    <div className="min-h-screen w-full">
      <Navigation
        leftUrl="/live-timing"
        rightUrl="/schedule"
        leftTitle={dict.home.dashboardButton}
        rightTitle={dict.home.scheduleButton}
        f1t_url={f1t}
        maxScrollPosition={100}
      />
      <div className="h-screen py-5 w-full bg-cover bg-center isolate">
        <Image
          src={config.public.assets.f1telemetrybg_v1}
          alt="F1 Telemetry Background"
          fill
          priority
          quality={85}
          className="object-cover -z-10 w-full h-full"
        />
        <div className="flex flex-col justify-evenly h-full justify-center items-center max-w-4xl mx-auto">
          <div className="flex justify-center w-full items-center">
            <p className="text-gray-300 text-sm text-center px-2 font-geist font-medium">
              {Array.from(dict.home.version).map((char, idx) => {
                if (typeof char !== "string") return;
                return (
                  <ColorShift
                    key={idx}
                    text={char}
                    animateLetters={true}
                    letterDelay={150 * idx}
                    letterColor={
                      idx < dict.home.version.length * 0.25
                        ? "#3b83f6ab"
                        : idx >= dict.home.version.length * 0.25 &&
                            idx < dict.home.version.length * 0.6
                          ? "#ffe066ab"
                          : idx > dict.home.version.length * 0.8
                            ? "#A855F7ab"
                            : "#338540"
                    }
                  />
                );
              })}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Image
              src={config.public.assets.f1t_black}
              height={150}
              width={250}
              alt="F1 Telemetry black logo"
            />
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
                hover:border-transparent
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
          <div className="flex flex-col gap-[1rem]">
            <h2 className="text-xl text-gray-300 text-center font-geist font-medium m-6 lg:m-0">
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
