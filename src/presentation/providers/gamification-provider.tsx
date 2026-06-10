"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface GamificationContextType {
  isLivingWorldEnabled: boolean;
}

const GamificationContext = createContext<GamificationContextType>({
  isLivingWorldEnabled: false,
});

export function GamificationProvider({ children }: { children: ReactNode }) {
  // Safe fallback to false if not strictly "true"
  const isLivingWorldEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVING_WORLD === "true";

  return (
    <GamificationContext.Provider value={{ isLivingWorldEnabled }}>
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
