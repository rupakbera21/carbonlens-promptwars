"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  Environment,
  Float,
  Sparkles,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { Volume2, VolumeX } from "lucide-react";

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

const ECO_HINTS = [
  "Hint: Switching to renewable energy reduces your footprint significantly!",
  "Hint: Plant-based meals save up to 2.5kg of CO2 compared to meat.",
  "Hint: Unplugging devices when not in use stops vampire energy drain.",
  "Hint: Carpooling or taking public transit cuts your emissions by half.",
  "Hint: Recycling paper saves trees and preserves the planet's lungs.",
  "Hint: A 5-minute shower saves dozens of gallons of water.",
];

function ActionShockwave({
  lastAction,
}: {
  lastAction?: { type: "positive" | "negative"; timestamp: number } | null;
}) {
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

function useAudioEngine(isGameOver: boolean | undefined, isSoundEnabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const explosionPlayed = useRef(false);

  const isSoundEnabledRef = useRef(isSoundEnabled);
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
    if (audioCtxRef.current) {
      if (isSoundEnabled) {
        audioCtxRef.current.resume();
      } else {
        audioCtxRef.current.suspend();
      }
    }
  }, [isSoundEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let voices: { osc: OscillatorNode; lfo: OscillatorNode; mainGain: GainNode }[] = [];

    const handleInteraction = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        const ctx = audioCtxRef.current;

        const createBreathingOsc = (freq: number, pan: number) => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const lfo = ctx.createOscillator();
          lfo.type = "sine";
          // Extremely slow, calm breathing rate (1 cycle every ~15 seconds)
          lfo.frequency.setValueAtTime(0.04 + Math.random() * 0.03, ctx.currentTime);

          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.03, ctx.currentTime); // Gentle depth of breathing

          const mainGain = ctx.createGain();
          mainGain.gain.setValueAtTime(0.02, ctx.currentTime); // Very soft base volume

          const panner = ctx.createStereoPanner();
          panner.pan.value = pan;

          lfo.connect(lfoGain);
          lfoGain.connect(mainGain.gain); // Modulate amplitude

          osc.connect(mainGain);
          mainGain.connect(panner);
          panner.connect(ctx.destination);

          osc.start();
          lfo.start();

          return { osc, lfo, mainGain };
        };

        // Create an extremely calm, soft C-Major 7 ambient pad
        voices = [
          createBreathingOsc(65.41, -0.5), // C2
          createBreathingOsc(98.0, 0.5), // G2
          createBreathingOsc(130.81, -0.2), // C3
          createBreathingOsc(164.81, 0.2), // E3
          createBreathingOsc(246.94, 0.0), // B3
        ];
      }
      if (audioCtxRef.current.state === "suspended" && isSoundEnabledRef.current) {
        audioCtxRef.current.resume();
      }
    };

    window.addEventListener("click", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      voices.forEach((v) => {
        v.osc.stop();
        v.lfo.stop();
        v.osc.disconnect();
        v.lfo.disconnect();
        v.mainGain.disconnect();
      });
    };
  }, []);

  useEffect(() => {
    if (isGameOver && !explosionPlayed.current && audioCtxRef.current && isSoundEnabled) {
      explosionPlayed.current = true;
      const ctx = audioCtxRef.current;

      // Synthesize deep explosion
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // White noise
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start();
    }
  }, [isGameOver]);
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

function Planet({ state, isGameOver }: { state: WorldState; isGameOver?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.05;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.07;

    if (isGameOver && groupRef.current) {
      if (groupRef.current.scale.x > 0.01) {
        groupRef.current.scale.lerp(new THREE.Vector3(0, 0, 0), delta * 4);
      } else {
        groupRef.current.visible = false;
      }
    }
  });

  const targetWaterColor = useMemo(() => {
    if (isGameOver) return new THREE.Color("#450a0a"); // Magma red
    return new THREE.Color().lerpColors(
      new THREE.Color("#1a365d"), // Polluted dark ocean
      new THREE.Color("#0ea5e9"), // Vibrant clean ocean
      state.waterQuality / 100,
    );
  }, [state.waterQuality, isGameOver]);

  const targetLandColor = useMemo(() => {
    if (isGameOver) return new THREE.Color("#171717"); // Scorched earth
    return new THREE.Color().lerpColors(
      new THREE.Color("#78350f"), // Barren earth
      new THREE.Color("#22c55e"), // Lush green forest
      state.forestHealth / 100,
    );
  }, [state.forestHealth, isGameOver]);

  const [waterColor] = useState(() => targetWaterColor.clone());
  const [landColor] = useState(() => targetLandColor.clone());

  // Smooth color transitions
  useFrame((_, delta) => {
    waterColor.lerp(targetWaterColor, delta * 2);
    landColor.lerp(targetLandColor, delta * 2);
  });

  const earthMask = useTexture("/earth-mask.jpg");

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        {/* Core Landmass (Inside) */}
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color={landColor}
          roughness={0.8}
          metalness={0.1}
          wireframe={state.forestHealth < 40 && !isGameOver}
        />

        {/* Water Ocean Layer (Uses Alpha Map to reveal land) */}
        <mesh scale={1.015}>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            color={waterColor}
            roughness={0.4}
            metalness={0.1}
            alphaMap={earthMask}
            transparent
            opacity={0.95}
            envMapIntensity={2}
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
      {state.biodiversity > 30 && !isGameOver && (
        <Sparkles
          count={Math.floor(state.biodiversity * 6)}
          scale={5.5}
          size={state.biodiversity / 8}
          speed={0.4}
          color={state.biodiversity > 70 ? "#fbbf24" : "#a3e635"}
        />
      )}

      {/* Procedural Vegetation and Cities */}
      {!isGameOver && (
        <>
          <ProceduralNature forestHealth={state.forestHealth} />
          <ProceduralCity phiScore={state.phiScore} waterQuality={state.waterQuality} />
        </>
      )}
    </group>
  );
}

// Procedural Trees
function ProceduralNature({ forestHealth }: { forestHealth: number }) {
  const count = Math.floor((Math.max(0, forestHealth - 30) / 70) * 150); // Up to 150 trees

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || count === 0) return;
    const dummy = new THREE.Object3D();

    // Seeded random for consistent placement
    let seed = 12345;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const r = 2.02; // Slightly above core
      dummy.position.setFromSphericalCoords(r, phi, theta);
      dummy.lookAt(0, 0, 0);
      dummy.rotateX(Math.PI / 2); // Point outward

      const scale = 0.5 + random() * 0.5;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 150]} count={count}>
      <coneGeometry args={[0.04, 0.15, 5]} />
      <meshStandardMaterial color="#15803d" roughness={0.9} />
    </instancedMesh>
  );
}

// Procedural Cities
function ProceduralCity({
  phiScore,
  waterQuality,
}: {
  phiScore: number;
  waterQuality: number;
}) {
  const count = Math.floor((Math.max(0, phiScore - 50) / 50) * 80); // Up to 80 buildings
  const isRuined = waterQuality < 40 || phiScore < 40;

  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!meshRef.current || count === 0) return;
    const dummy = new THREE.Object3D();

    let seed = 98765;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi + Math.PI; // Offset from trees

      const r = 2.02;
      dummy.position.setFromSphericalCoords(r, phi, theta);
      dummy.lookAt(0, 0, 0);

      const heightScale = isRuined ? 0.3 + random() * 0.2 : 0.8 + random() * 1.5;
      dummy.scale.set(1, 1, heightScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, isRuined]);

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, 80]} count={count}>
      <boxGeometry args={[0.03, 0.03, 0.1]} />
      <meshStandardMaterial
        color={isRuined ? "#525252" : "#e2e8f0"}
        roughness={0.2}
        metalness={0.8}
        emissive={isRuined ? "#000000" : "#38bdf8"}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
}

// --- Solar System & Galaxies ---
function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[4, 64, 64]} />
      <meshBasicMaterial color="#fcd34d" />
      <pointLight color="#fde047" intensity={5} distance={100} decay={2} />
    </mesh>
  );
}

function OrbitRing({ radius }: { radius: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.04, radius + 0.04, 64]} />
      <meshBasicMaterial
        color="#0ea5e9"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitingPlanet({
  index,
  totalPlanets,
  state,
  isGameOver,
}: {
  index: number;
  totalPlanets: number;
  state: WorldState;
  isGameOver?: boolean;
}) {
  const ref = useRef<THREE.Group>(null);
  const distance = totalPlanets > 1 ? 6 + index * 4 : 0;
  const speed = 0.2 / (index + 1);

  useFrame((_, delta) => {
    if (ref.current && totalPlanets > 1) {
      ref.current.rotation.y += delta * speed;
    }
  });

  return (
    <group ref={ref}>
      <group position={[distance, 0, 0]}>
        <Planet state={state} isGameOver={isGameOver} />
        {/* Only show shockwaves and big bang on the active outer planet */}
        {index === totalPlanets - 1 && <BigBang active={!!isGameOver} />}
      </group>
    </group>
  );
}

function SolarSystem({ state, isGameOver }: { state: WorldState; isGameOver?: boolean }) {
  let totalPlanets = 1;
  let activePlanetScore = state.phiScore;

  if (state.phiScore > 100) {
    totalPlanets = Math.floor((state.phiScore - 1) / 100) + 1;
    activePlanetScore = ((state.phiScore - 1) % 100) + 1;
  } else if (state.phiScore < 0) {
    activePlanetScore = 0;
  }

  const planets = Array.from({ length: totalPlanets }).map((_, i) => {
    const isActive = i === totalPlanets - 1;
    // Older planets are perfectly healthy
    const planetState = isActive
      ? {
          ...state,
          phiScore: activePlanetScore,
        }
      : {
          phiScore: 100,
          forestHealth: 100,
          waterQuality: 100,
          airQuality: 100,
          biodiversity: 100,
        };
    return (
      <OrbitingPlanet
        key={i}
        index={i}
        totalPlanets={totalPlanets}
        state={planetState as WorldState}
        isGameOver={isActive ? isGameOver : false}
      />
    );
  });

  const rings = totalPlanets > 1
    ? Array.from({ length: totalPlanets }).map((_, i) => (
        <OrbitRing key={`ring-${i}`} radius={6 + i * 4} />
      ))
    : null;

  return (
    <group>
      {totalPlanets > 1 && <Sun />}
      {rings}
      {planets}
    </group>
  );
}

export function LivingCarbonWorld({
  worldState,
  lastAction,
  isGameOver,
}: LivingCarbonWorldProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  let totalPlanets = 1;
  let activePlanetScore = worldState.phiScore;
  if (worldState.phiScore > 100) {
    totalPlanets = Math.floor((worldState.phiScore - 1) / 100) + 1;
    activePlanetScore = ((worldState.phiScore - 1) % 100) + 1;
  } else if (worldState.phiScore < 0) {
    activePlanetScore = 0;
  }

  useAudioEngine(isGameOver, isSoundEnabled);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      // 50% chance to show a hint every 15 seconds
      if (Math.random() > 0.5) {
        const hint = ECO_HINTS[Math.floor(Math.random() * ECO_HINTS.length)];
        setActiveHint(hint);
        setTimeout(() => setActiveHint(null), 7000); // hide after 7s
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isGameOver]);

  return (
    <div
      className="relative h-[400px] w-full overflow-hidden rounded-xl bg-slate-950 shadow-[0_0_40px_rgba(14,165,233,0.15)] ring-1 ring-white/10"
      aria-label="Interactive 3D living carbon world representing your planet health index"
      role="img"
    >
      <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }}>
        <React.Suspense fallback={null}>
          <color attach="background" args={["#020617"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={2} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0ea5e9" />

          {/* Main Solar System Renderer */}
          <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
            <SolarSystem state={worldState} isGameOver={isGameOver} />
          </Float>

          <Stars
            radius={150}
            depth={100}
            count={10000}
            factor={6}
            saturation={0.5}
            fade
            speed={1.5}
          />

          <Environment preset="night" />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={3.5}
            maxDistance={totalPlanets > 1 ? 50 : 12}
            autoRotate={false}
          />
        </React.Suspense>
      </Canvas>

      {/* Floating Glassmorphism Overlay */}
      <div className="absolute bottom-6 left-6 rounded-2xl border border-white/20 bg-black/40 p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-black/50">
        <h3 className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-2xl font-black text-transparent drop-shadow-md">
          {totalPlanets > 1 ? "Solar System" : "Planet Health"}:{" "}
          {activePlanetScore.toFixed(2)}%
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${activePlanetScore > 50 ? "bg-emerald-400" : "bg-red-400"}`}
            ></span>
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${activePlanetScore > 50 ? "bg-emerald-500" : "bg-red-500"}`}
            ></span>
          </span>
          <p className="text-sm font-medium uppercase tracking-wider opacity-90">
            {worldState.phiScore >= 1000
              ? "Expanding Galaxy"
              : totalPlanets > 1
                ? `Orbiting ${totalPlanets} Planets`
                : activePlanetScore > 80
                  ? "Thriving World"
                  : activePlanetScore > 50
                    ? "Stable Orbit"
                    : worldState.phiScore <= 0
                      ? "Barren World"
                      : "Critical Condition"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
        className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/60"
        aria-label="Toggle Sound"
      >
        {isSoundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </button>

      {/* Floating Hint Alert */}
      <div
        className={`absolute left-1/2 top-6 z-20 -translate-x-1/2 rounded-full border border-teal-500/30 bg-black/70 px-6 py-2 text-sm font-medium text-teal-200 shadow-[0_0_20px_rgba(20,184,166,0.3)] backdrop-blur-md transition-all duration-500 ${
          activeHint
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <span className="mr-2 animate-pulse text-teal-400">💡</span>
        {activeHint}
      </div>
    </div>
  );
}
