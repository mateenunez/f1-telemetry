"use client";

import { steps } from "@/utils/tourSteps";
import { TourProvider as ReactourTourProvider } from "@reactour/tour";
import React, { ReactNode } from "react";
import { usePreferences } from "@/context/preferences";
import { Geist } from "next/font/google";

interface TourProviderProps {
  children: ReactNode;
  dict: any;
}

const disableBodyScroll = () => {
  document.body.style.overflow = "hidden";
};

const enableBodyScroll = () => {
  document.body.style.overflow = "";
};

const mediumGeist = Geist({ subsets: ["latin"], weight: "500" });

const oled = {
  popover: (base: any) => ({
    ...base,
    padding: "2rem",
    paddingTop: "3rem",

    backgroundColor: "#1a1a1a",
    color: "#F3F3F3",
    boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.5)",
    borderRadius: "8px",
    fontFamily: mediumGeist.style.fontFamily,
    fontStyle: mediumGeist.style.fontStyle,
    fontWeight: mediumGeist.style.fontWeight,
  }),

  close: (base: any) => ({
    ...base,
    width: "0.75rem",
    height: "0.75rem",
    color: "#AAAAAA",
  }),

  dot: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.current ? "#F3F3F3" : "#444444",
    border: "none",
  }),
};

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  dict,
}) => {
  const { setPreference } = usePreferences();

  const handleClickClose = (clickProps: any) => {
    setPreference("hasSeenTour", true);
    clickProps.setIsOpen(false);
  };

  return (
    <ReactourTourProvider
      steps={steps(dict)}
      afterOpen={disableBodyScroll}
      beforeClose={enableBodyScroll}
      onClickClose={handleClickClose}
      showBadge={false}
      styles={oled}
    >
      {children}
    </ReactourTourProvider>
  );
};
