"use client";

import React from "react";

interface WorldState {
  phiScore: number;
  forestHealth: number;
  waterQuality: number;
  airQuality: number;
  biodiversity: number;
}

interface LivingCarbonWorldFallbackProps {
  worldState: WorldState;
}

/**
 * LivingCarbonWorldFallback - A gorgeous 2D fallback UI for the 3D Planet widget
 * when WebGL is unsupported, or when loading the 3D scene crashes.
 */
export function LivingCarbonWorldFallback({
  worldState,
}: LivingCarbonWorldFallbackProps) {
  const phiPercentage = worldState ? worldState.phiScore % 100 : 0;
  const isHealthy = phiPercentage > 50;

  let statusText = "Stable Orbit";
  if (worldState.phiScore >= 1000) {
    statusText = "Expanding Galaxy";
  } else if (worldState.phiScore >= 100) {
    statusText = `Orbiting ${Math.floor(worldState.phiScore / 100) + 1} Planets`;
  } else if (phiPercentage > 80) {
    statusText = "Thriving World";
  } else if (phiPercentage > 50) {
    statusText = "Stable Orbit";
  } else if (phiPercentage <= 0 && worldState.phiScore <= 0) {
    statusText = "Barren World";
  } else {
    statusText = "Critical Condition";
  }

  return (
    <div
      className="relative flex h-[400px] w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-slate-950 shadow-[0_0_40px_rgba(14,165,233,0.15)] ring-1 ring-white/10"
      aria-label="Interactive 2D living carbon world fallback"
      role="img"
    >
      {/* Dynamic Background Stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.3)_0%,rgba(2,6,23,1)_100%)] opacity-80" />
      <div className="absolute left-0 top-0 h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjUwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iMTgwIiBjeT0iMTIwIiByPSIxLjUiZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMTYwIiByPSIwLjgiZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPjwvc3ZnPg==')] bg-repeat opacity-40" />

      {/* Glowing 2D Planet Sphere */}
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-slate-900 shadow-[0_0_80px_rgba(14,165,233,0.25)] ring-2 ring-white/5">
        {/* Atmosphere layer */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-emerald-500/20 blur-md transition-all duration-1000 ${
            isHealthy ? "opacity-80" : "opacity-30"
          }`}
        />

        {/* Planet sphere surface */}
        <div
          className={`h-44 w-44 rounded-full bg-gradient-to-br transition-all duration-1000 ${
            isHealthy
              ? "from-emerald-400/80 via-teal-600/80 to-blue-900/95 shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8)]"
              : "from-amber-700/80 via-red-800/80 to-zinc-900/95 shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.9)]"
          }`}
        />

        {/* Orbit Rings (if multiple planets are owned) */}
        {worldState.phiScore >= 100 && (
          <div className="absolute h-56 w-56 animate-[spin_20s_linear_infinite] rounded-full border border-dashed border-cyan-500/20" />
        )}
        {worldState.phiScore >= 200 && (
          <div className="absolute h-64 w-64 animate-[spin_35s_linear_infinite] rounded-full border border-dashed border-teal-500/15" />
        )}
      </div>

      {/* Info Badge at the Top Right */}
      <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 backdrop-blur-sm">
        2D View Mode
      </div>

      {/* Floating Glassmorphism Overlay */}
      <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/40 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-black/50">
        <h3 className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-2xl font-black text-transparent drop-shadow-md">
          {worldState.phiScore >= 100 ? "Solar System" : "Planet Health"}:{" "}
          {phiPercentage.toFixed(2)}%
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                isHealthy ? "bg-emerald-400" : "bg-red-400"
              }`}
            ></span>
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                isHealthy ? "bg-emerald-500" : "bg-red-500"
              }`}
            ></span>
          </span>
          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
            {statusText}
          </p>
        </div>
      </div>
    </div>
  );
}
