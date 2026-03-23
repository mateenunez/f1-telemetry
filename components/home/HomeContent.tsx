"use client";
import Image from "next/image";
import { config } from "@/lib/config";
import Navigation from "../Navigation";

interface HomeContentProps {
  dict: any;
}

export default function HomeContent({ dict }: HomeContentProps) {

  return (
    <div className="min-h-screen w-full">
      <Navigation
        leftUrl="/live-timing"
        rightUrl="/schedule"
        leftTitle={dict.home.dashboardButton}
        rightTitle={dict.home.scheduleButton}
        f1t_url={config.public.assets.f1_white}
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
          <div className="flex flex-col items-center">
            <Image
              src={config.public.assets.f1telemetry_black}
              height={500}
              width={500}
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
        <div className="flex flex-col min-h-[20rem] h-full gap-[2rem] justify-center items-center max-w-4xl mx-auto">
          <div className="flex flex-col gap-[1rem]">
            <h2 className="text-xl text-gray-300 text-center font-geist font-medium m-6 lg:m-0">
              {dict.home.description}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
