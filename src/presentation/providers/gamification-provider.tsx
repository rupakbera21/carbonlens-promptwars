"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface GamificationContextType {
  isLivingWorldEnabled: boolean;
  isDetectiveMissionsEnabled: boolean;
  isCommunityChallengesEnabled: boolean;
}

const GamificationContext = createContext<GamificationContextType>({
  isLivingWorldEnabled: false,
  isDetectiveMissionsEnabled: false,
  isCommunityChallengesEnabled: false,
});

export function GamificationProvider({ children }: { children: ReactNode }) {
  const isLivingWorldEnabled = true;
  const isDetectiveMissionsEnabled = true;
  const isCommunityChallengesEnabled = true;

  return (
    <GamificationContext.Provider
      value={{
        isLivingWorldEnabled,
        isDetectiveMissionsEnabled,
        isCommunityChallengesEnabled,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}
