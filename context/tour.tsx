"use client";

import { steps } from "@/utils/tourSteps";
import { TourProvider as ReactourTourProvider } from "@reactour/tour";
import React, { ReactNode } from "react";
import { usePreferences } from "@/context/preferences";

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
      styles={{
        popover: (base) => ({
          ...base,
          padding: '2rem',
          paddingTop: '3rem',
        }),
        close: (base) => ({ 
          ...base, 
          // padding: '0.75rem',
          width: '0.75rem',
          height: '0.75rem',
        }),
      }}
    >
      {children}
    </ReactourTourProvider>
  );
};
