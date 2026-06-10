"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem("carbonlens-theme");
    if (saved) setTheme(saved as Theme);

    const savedHC = localStorage.getItem("carbonlens-high-contrast");
    if (savedHC) setHighContrast(savedHC === "true");

    const savedRM = localStorage.getItem("carbonlens-reduced-motion");
    if (savedRM) setReducedMotion(savedRM === "true");
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
    localStorage.setItem("carbonlens-theme", theme);

    // Apply high contrast
    root.classList.toggle("high-contrast", highContrast);
    localStorage.setItem("carbonlens-high-contrast", String(highContrast));

    // Apply reduced motion
    root.classList.toggle("reduce-motion", reducedMotion);
    localStorage.setItem("carbonlens-reduced-motion", String(reducedMotion));
  }, [theme, highContrast, reducedMotion]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        highContrast,
        setHighContrast,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
