"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LOST_GIFS = [
  "https://media.tenor.com/nEP6ovplEd8AAAAi/so-really.gif",
  "https://media1.tenor.com/m/CbhnRg0n7ksAAAAC/kermit-the-frog-looking-for-directions.gif",
  "https://media1.tenor.com/m/PPOe9MawAvsAAAAd/404-not-found.gif",
];

export default function NotFound() {
  const [selectedGif, setSelectedGif] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOST_GIFS.length);
    setSelectedGif(LOST_GIFS[randomIndex]);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="relative w-full aspect-video max-w-md rounded-lg overflow-hidden">
          {selectedGif ? (
            <img
              src={selectedGif || "/placeholder.svg"}
              alt="Lost animation"
              className="w-full h-full object-fit"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 animate-pulse" />
          )}
        </div>
        <Link href="/">
          <Button
            size="lg"
            className="bg-transparent font-geist text-lg  border border-f1Yellow rounded hover:bg-f1Yellow/90 text-gray-200 hover:text-warmBlack hover:border-warmBlack"
          >
            Box Box!
          </Button>
        </Link>
      </div>
    </div>
  );
}
