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
      width: 24,
      height: 24,
      vx: 0,
      vy: 0,
      speed: 4,
      jumpStrength: -11,
      grounded: false,
      direction: 1, // 1 for right, -1 for left
    };

    const gravity = 0.5;
    const keys = { ArrowLeft: false, ArrowRight: false, " ": false };

    const LEVEL_WIDTH = 2400;

    const platforms = [
      { x: 0, y: 350, w: LEVEL_WIDTH, h: 50 }, // Ground
      { x: 200, y: 280, w: 120, h: 20 },
      { x: 400, y: 220, w: 120, h: 20 },
      { x: 600, y: 160, w: 120, h: 20 },
      { x: 100, y: 120, w: 120, h: 20 },
      // Extended level
      { x: 800, y: 250, w: 150, h: 20 },
      { x: 1050, y: 200, w: 100, h: 20 },
      { x: 1300, y: 150, w: 150, h: 20 },
      { x: 1600, y: 280, w: 120, h: 20 },
      { x: 1800, y: 220, w: 100, h: 20 },
      { x: 2050, y: 180, w: 150, h: 20 },
    ];

    let coins = [
      { x: 250, y: 250, collected: false },
      { x: 450, y: 190, collected: false },
      { x: 650, y: 130, collected: false },
      { x: 150, y: 90, collected: false },
      { x: 720, y: 320, collected: false },
      // Extended level coins
      { x: 850, y: 220, collected: false },
      { x: 1080, y: 170, collected: false },
      { x: 1350, y: 120, collected: false },
      { x: 1650, y: 250, collected: false },
      { x: 1830, y: 190, collected: false },
      { x: 2100, y: 150, collected: false },
    ];

    // Villains patrolling platforms
    let villains = [
      { x: 220, y: 256, width: 24, height: 24, vx: 1.5, minX: 200, maxX: 300, dead: false },
      { x: 420, y: 196, width: 24, height: 24, vx: 2, minX: 400, maxX: 500, dead: false },
      { x: 300, y: 326, width: 24, height: 24, vx: 1, minX: 100, maxX: 700, dead: false },
      // Extended level villains
      { x: 850, y: 226, width: 24, height: 24, vx: 2, minX: 800, maxX: 950, dead: false },
      { x: 1320, y: 126, width: 24, height: 24, vx: 2.5, minX: 1300, maxX: 1450, dead: false },
      { x: 1620, y: 256, width: 24, height: 24, vx: 1.5, minX: 1600, maxX: 1720, dead: false },
      { x: 1000, y: 326, width: 24, height: 24, vx: 2, minX: 800, maxX: 2000, dead: false },
    ];

    const flagpole = { x: 2250, y: 100, width: 20, height: 250 };

    let currentScore = 0;
    const MAX_SCORE = coins.length * 10;

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
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const loop = () => {
      if (gameState !== "playing") return;

      // Update Physics
      if (keys.ArrowLeft) {
        player.vx = -player.speed;
        player.direction = -1;
      } else if (keys.ArrowRight) {
        player.vx = player.speed;
        player.direction = 1;
      } else player.vx = 0;

      if (keys[" "] && player.grounded) {
        player.vy = player.jumpStrength;
        player.grounded = false;
      }

      player.vy += gravity;

      player.x += player.vx;
      player.y += player.vy;

      // Restrict to bounds
      if (player.x < 0) player.x = 0;
      if (player.x > LEVEL_WIDTH - player.width) player.x = LEVEL_WIDTH - player.width;

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

      // Update Villains
      for (const v of villains) {
        if (v.dead) continue;
        v.x += v.vx;
        if (v.x < v.minX || v.x + v.width > v.maxX) {
          v.vx *= -1;
        }

        // Collision with player
        if (checkCollision(player, v)) {
          // If falling from above, kill villain (Mario style stomp)
          if (player.vy > 0 && player.y + player.height < v.y + v.height / 2) {
            v.dead = true;
            player.vy = player.jumpStrength * 0.7; // Bounce
          } else {
            // Hit from side -> game over
            setGameState("gameover");
          }
        }
      }

      // Check coins
      for (const c of coins) {
        if (!c.collected) {
          const dx = player.x + player.width / 2 - c.x;
          const dy = player.y + player.height / 2 - c.y;
          if (Math.sqrt(dx * dx + dy * dy) < 20) {
            c.collected = true;
            currentScore += 10;
            setScore(currentScore);
          }
        }
      }

      // Game Over condition (fall off)
      if (player.y > canvas.height) {
        setGameState("gameover");
      }

      // Win condition (Touch Flagpole)
      if (checkCollision(player, flagpole)) {
        currentScore = 100; // Bonus to next level!
        setScore(currentScore);
        setGameState("won");
      }

      // Calculate camera scroll
      let cameraX = player.x - canvas.width / 2;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > LEVEL_WIDTH - canvas.width) cameraX = LEVEL_WIDTH - canvas.width;

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background (Static, doesn't scroll)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#38bdf8"); // Sky blue
      gradient.addColorStop(1, "#bae6fd");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply camera transform for level objects
      ctx.save();
      ctx.translate(-cameraX, 0);

      // Platforms
      ctx.fillStyle = "#166534"; // Dark green top
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = "#854d0e"; // Brown dirt
        ctx.fillRect(p.x, p.y + 5, p.w, p.h - 5);
        ctx.fillStyle = "#166534";
      }

      // Flagpole
      ctx.fillStyle = "#d1d5db"; // Pole
      ctx.fillRect(flagpole.x, flagpole.y, flagpole.width / 4, flagpole.height);
      ctx.fillStyle = "#22c55e"; // Flag
      ctx.fillRect(flagpole.x + flagpole.width / 4, flagpole.y + 10, 60, 40);

      // Fonts
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Coins
      for (const c of coins) {
        if (!c.collected) {
          ctx.fillText("🍃", c.x, c.y);
        }
      }

      // Villains
      for (const v of villains) {
        if (!v.dead) {
          ctx.save();
          if (v.vx > 0) {
            ctx.translate(v.x + v.width, v.y);
            ctx.scale(-1, 1);
            ctx.fillText("👾", v.width / 2, v.height / 2);
          } else {
            ctx.fillText("👾", v.x + v.width / 2, v.y + v.height / 2);
          }
          ctx.restore();
        }
      }

      // Player (Always same character)
      ctx.save();
      ctx.fillText("🧑‍🚀", player.x + player.width / 2, player.y + player.height / 2);
      ctx.restore();

      // Restore camera transform
      ctx.restore();
      
      // Draw UI (Static over the camera)
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "left";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(`Score: ${currentScore}/${MAX_SCORE}`, 20, 30);

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
