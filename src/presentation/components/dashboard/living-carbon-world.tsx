"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Environment, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface WorldState {
  phiScore: number;
  forestHealth: number;
  waterQuality: number;
  airQuality: number;
  biodiversity: number;
}

interface LivingCarbonWorldProps {
  worldState: WorldState;
  lastAction?: { type: "positive" | "negative"; timestamp: number } | null;
  isGameOver?: boolean;
}

function ActionShockwave({ lastAction }: { lastAction?: { type: "positive" | "negative"; timestamp: number } | null }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [active, setActive] = useState(false);
  const [color, setColor] = useState("#00ff00");

  useEffect(() => {
    if (lastAction) {
      setColor(lastAction.type === "positive" ? "#4ade80" : "#f87171");
      setActive(true);
      if (meshRef.current) {
        meshRef.current.scale.set(1, 1, 1);
      }
      if (materialRef.current) {
        materialRef.current.opacity = 0.8;
      }
    }
  }, [lastAction]);

  useFrame((_, delta) => {
    if (active && meshRef.current && materialRef.current) {
      meshRef.current.scale.addScalar(delta * 4); // Expand outward
      materialRef.current.opacity -= delta * 0.8; // Fade out
      if (materialRef.current.opacity <= 0) {
        setActive(false);
      }
    }
  });

  return (
    <mesh ref={meshRef} visible={active}>
      <sphereGeometry args={[2.05, 32, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function BigBang({ active }: { active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const [exploded, setExploded] = useState(false);

  useEffect(() => {
    if (active && !exploded) {
      setExploded(true);
      if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
      if (materialRef.current) materialRef.current.opacity = 1;
    }
  }, [active, exploded]);

  useFrame((_, delta) => {
    if (exploded && meshRef.current && materialRef.current) {
      if (meshRef.current.scale.x < 30) {
        meshRef.current.scale.addScalar(delta * 20);
        materialRef.current.opacity -= delta * 0.5;
      }
    }
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.1, 32, 32]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#ff1100"
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Planet({ state, isGameOver }: { state: WorldState, isGameOver?: boolean }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.07;
  });

  const targetWaterColor = useMemo(() => {
    if (isGameOver) return new THREE.Color("#450a0a"); // Magma red
    return new THREE.Color().lerpColors(
      new THREE.Color("#1a365d"), // Polluted dark ocean
      new THREE.Color("#0ea5e9"), // Vibrant clean ocean
      state.waterQuality / 100
    );
  }, [state.waterQuality, isGameOver]);
  
  const targetLandColor = useMemo(() => {
    if (isGameOver) return new THREE.Color("#171717"); // Scorched earth
    return new THREE.Color().lerpColors(
      new THREE.Color("#78350f"), // Barren earth
      new THREE.Color("#22c55e"), // Lush green forest
      state.forestHealth / 100
    );
  }, [state.forestHealth, isGameOver]);

  const [waterColor] = useState(() => targetWaterColor.clone());
  const [landColor] = useState(() => targetLandColor.clone());

  // Smooth color transitions
  useFrame((_, delta) => {
    waterColor.lerp(targetWaterColor, delta * 2);
    landColor.lerp(targetLandColor, delta * 2);
  });

  return (
    <group>
      {/* Deep Ocean Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color={waterColor}
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={2}
        />
        
        {/* Landmass Layer (Stylized) */}
        <mesh scale={1.015}>
          <icosahedronGeometry args={[2, 12]} />
          <meshStandardMaterial
            color={landColor}
            roughness={0.8}
            metalness={0.1}
            transparent
            opacity={0.85}
            wireframe={state.forestHealth < 40}
          />
        </mesh>
      </mesh>

      {/* Dynamic Cloud Layer */}
      <mesh ref={cloudsRef} scale={1.04}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.25 + (state.airQuality / 100) * 0.15}
          roughness={1}
          depthWrite={false}
          wireframe
        />
      </mesh>

      {/* Atmospheric Glow */}
      <mesh scale={1.12}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color={state.airQuality > 50 ? "#38bdf8" : "#f87171"}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Vibrant Biodiversity Sparkles */}
      {state.biodiversity > 30 && (
        <Sparkles
          count={Math.floor(state.biodiversity * 6)}
          scale={5.5}
          size={state.biodiversity / 8}
          speed={0.4}
          color={state.biodiversity > 70 ? "#fbbf24" : "#a3e635"}
        />
      )}
    </group>
  );
}

export function LivingCarbonWorld({ worldState, lastAction, isGameOver }: LivingCarbonWorldProps) {
  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-xl bg-slate-950 shadow-[0_0_40px_rgba(14,165,233,0.15)] ring-1 ring-white/10"
      aria-label="Interactive 3D living carbon world representing your planet health index"
      role="img"
    >
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />

        <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
          <Planet state={worldState} isGameOver={isGameOver} />
          <ActionShockwave lastAction={lastAction} />
          <BigBang active={!!isGameOver} />
        </Float>

        {worldState.airQuality > 40 && (
          <Stars
            radius={100}
            depth={50}
            count={6000}
            factor={5}
            saturation={0.5}
            fade
            speed={1.5}
          />
        )}

        <Environment preset="night" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3.5}
          maxDistance={12}
          autoRotate={false}
        />
      </Canvas>

      {/* Floating Glassmorphism Overlay */}
      <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/40 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-black/50 hover:border-white/30">
        <h3 className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-2xl font-black text-transparent drop-shadow-md">
          Planet Health: {worldState.phiScore.toFixed(1)}%
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${worldState.phiScore > 50 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex h-3 w-3 rounded-full ${worldState.phiScore > 50 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
            {worldState.phiScore > 80
              ? "Thriving World"
              : worldState.phiScore > 50
                ? "Stable Orbit"
                : "Critical Condition"}
          </p>
        </div>
      </div>
    </div>
  );
}
