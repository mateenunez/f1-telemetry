"use client";

import { useEffect } from "react";

const monetagScripts = [
  { zone: "11654017", src: "https://nap5k.com/tag.min.js" },
  { zone: "11654025", src: "https://n6wxm.com/vignette.min.js" },
];

export default function MonetagScripts() {
  useEffect(() => {
    for (const { zone, src } of monetagScripts) {
      if (document.querySelector(`script[data-monetag-zone="${zone}"]`)) {
        continue;
      }

      const script = document.createElement("script");
      script.dataset.monetagZone = zone;
      script.dataset.zone = zone;
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null;
}