"use client";

import React, { useRef, useMemo } from "react";
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
}

function Planet({ state }: { state: WorldState }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Rotate planet slowly
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  // Calculate colors based on health (0-100)
  const getWaterColor = (health: number) => {
    const clean = new THREE.Color("#1ca3ec");
    const polluted = new THREE.Color("#4a4e4d");
    return polluted.clone().lerp(clean, health / 100);
  };

  const getLandColor = (health: number) => {
    const rich = new THREE.Color("#2e8b57");
    const barren = new THREE.Color("#8b7355");
    return barren.clone().lerp(rich, health / 100);
  };

  const waterColor = useMemo(
    () => getWaterColor(state.waterQuality),
    [state.waterQuality],
  );
  const landColor = useMemo(() => getLandColor(state.forestHealth), [state.forestHealth]);

  return (
    <group>
      {/* The Core Planet (Water Base) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color={waterColor}
          roughness={0.1}
          metalness={0.1}
          envMapIntensity={1.5}
        />

        {/* Landmasses (Noise-based bump map illusion via wireframe or secondary sphere) */}
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color={landColor}
            roughness={0.8}
            metalness={0.0}
            wireframe={state.forestHealth < 30} // If dead, look barren/wirey
            transparent
            opacity={state.forestHealth / 100}
          />
        </mesh>
      </mesh>

      {/* Atmosphere / Air Quality Glow */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color={state.airQuality > 50 ? "#a8e6cf" : "#ff8b94"}
          transparent
          opacity={Math.max(0.1, (100 - state.airQuality) / 200)}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Biodiversity Sparkles */}
      {state.biodiversity > 50 && (
        <Sparkles
          count={Math.floor(state.biodiversity * 5)}
          scale={5}
          size={state.biodiversity / 10}
          speed={0.4}
          color="#ffeb3b"
        />
      )}
    </group>
  );
}

export function LivingCarbonWorld({ worldState }: LivingCarbonWorldProps) {
  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-xl bg-slate-900 shadow-2xl"
      aria-label="Interactive 3D living carbon world representing your planet health index"
      role="img"
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#444" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <Planet state={worldState} />
        </Float>

        {worldState.airQuality > 50 && (
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        )}

        <Environment preset="night" />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={10}
          autoRotate={false}
        />
      </Canvas>

      {/* PHI Overlay */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-white/10 bg-black/50 p-4 text-white backdrop-blur-md">
        <h3 className="text-xl font-bold">
          Planet Health: {worldState.phiScore.toFixed(1)}%
        </h3>
        <p className="mt-1 text-sm opacity-80">
          Level:{" "}
          {worldState.phiScore > 80
            ? "Thriving"
            : worldState.phiScore > 50
              ? "Stable"
              : "Critical"}
        </p>
      </div>
    </div>
  );
}
