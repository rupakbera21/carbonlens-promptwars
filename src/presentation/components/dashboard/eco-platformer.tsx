"use client";

import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/presentation/components/ui/button";

interface EcoPlatformerProps {
  onComplete: (score: number) => void;
  onClose: () => void;
}

export function EcoPlatformer({ onComplete, onClose }: EcoPlatformerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"playing" | "gameover" | "won">("playing");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    // Game state
    const player = {
      x: 50,
      y: 200,
      width: 20,
      height: 20,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpStrength: -10,
      grounded: false,
    };

    const gravity = 0.5;
    const keys = { ArrowLeft: false, ArrowRight: false, " ": false };

    const platforms = [
      { x: 0, y: 350, w: 800, h: 50 }, // Ground
      { x: 200, y: 280, w: 100, h: 20 },
      { x: 400, y: 220, w: 100, h: 20 },
      { x: 600, y: 160, w: 100, h: 20 },
      { x: 100, y: 120, w: 100, h: 20 },
    ];

    let coins = [
      { x: 240, y: 250, collected: false },
      { x: 440, y: 190, collected: false },
      { x: 640, y: 130, collected: false },
      { x: 140, y: 90, collected: false },
      { x: 700, y: 320, collected: false },
    ];

    let currentScore = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const checkCollision = (rect1: any, rect2: any) => {
      return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const loop = () => {
      if (gameState !== "playing") return;

      // Update Physics
      if (keys.ArrowLeft) player.vx = -player.speed;
      else if (keys.ArrowRight) player.vx = player.speed;
      else player.vx = 0;

      if (keys[" "] && player.grounded) {
        player.vy = player.jumpStrength;
        player.grounded = false;
      }

      player.vy += gravity;

      player.x += player.vx;
      player.y += player.vy;

      // Restrict to bounds
      if (player.x < 0) player.x = 0;
      if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;

      player.grounded = false;

      // Platform collisions
      for (const p of platforms) {
        // Simple top collision
        if (
          player.vy > 0 &&
          player.x < p.x + p.w &&
          player.x + player.width > p.x &&
          player.y + player.height > p.y &&
          player.y + player.height < p.y + p.h + player.vy
        ) {
          player.y = p.y - player.height;
          player.vy = 0;
          player.grounded = true;
        }
      }

      // Check coins
      for (const c of coins) {
        if (!c.collected) {
          const dx = player.x + player.width / 2 - c.x;
          const dy = player.y + player.height / 2 - c.y;
          if (Math.sqrt(dx * dx + dy * dy) < 15 + player.width / 2) {
            c.collected = true;
            currentScore += 1;
            setScore(currentScore);
          }
        }
      }

      // Game Over condition (fall off)
      if (player.y > canvas.height) {
        setGameState("gameover");
      }

      // Win condition
      if (currentScore === coins.length) {
        setGameState("won");
      }

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Platforms
      ctx.fillStyle = "#22c55e";
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
      }

      // Coins
      ctx.fillStyle = "#fbbf24";
      for (const c of coins) {
        if (!c.collected) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Player
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [gameState]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Eco-Platformer</h2>
          <span className="rounded-full bg-emerald-100 px-4 py-1 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
            Score: {score}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-xl border-4 border-slate-800">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="block"
          />

          {gameState !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center">
              <h3 className="mb-2 text-4xl font-black text-white">
                {gameState === "won" ? "Mission Complete!" : "Game Over!"}
              </h3>
              <p className="mb-6 text-xl text-slate-300">
                You collected {score} Eco-Coins.
              </p>
              <Button
                size="lg"
                onClick={() => onComplete(score)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                Claim Points & Exit
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          Use Left/Right arrows to move, Space to jump. Collect all Eco-Coins to win!
        </p>
      </div>
    </div>
  );
}
