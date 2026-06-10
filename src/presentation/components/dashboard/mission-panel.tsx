"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/presentation/components/ui/card";
import { Progress } from "@/presentation/components/ui/progress";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { EcoPlatformer } from "./eco-platformer";

interface Mission {
  id: string;
  missionType: string;
  progress: number;
  completed: boolean;
}

interface MissionPanelProps {
  onMissionComplete?: (score: number) => void;
}

export function MissionPanel({ onMissionComplete }: MissionPanelProps) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isPlatformerOpen, setIsPlatformerOpen] = useState(false);
  const [platformerMissionId, setPlatformerMissionId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/missions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          let fetchedMissions: Mission[] = data.data;
          
          // Inject Random Platformer Mission (Valid for today)
          const randomChance = Math.random();
          if (randomChance > 0.1) { // 90% chance for demo purposes
            const platformerMission = {
              id: "eco-platformer-daily",
              missionType: "Eco-Platformer Rescue",
              progress: 0,
              completed: false,
            };
            fetchedMissions = [platformerMission, ...fetchedMissions];
          }
          setMissions(fetchedMissions);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleStartMission = (missionId: string, type: string) => {
    if (type === "Eco-Platformer Rescue") {
      setPlatformerMissionId(missionId);
      setIsPlatformerOpen(true);
    }
  };

  const handlePlatformerComplete = (score: number) => {
    setIsPlatformerOpen(false);
    if (onMissionComplete) {
      onMissionComplete(score);
    }
    setMissions((prev) =>
      prev.map((m) =>
        m.id === platformerMissionId
          ? { ...m, progress: 100, completed: true }
          : m
      )
    );
  };

  if (missions.length === 0) return null;

  return (
    <Card className="border-indigo-500/20 shadow-indigo-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-400">
          <ShieldAlert className="h-5 w-5" />
          Active Detective Missions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map((mission) => (
          <div 
            key={mission.id} 
            className={`space-y-2 rounded-lg p-2 transition-colors ${mission.missionType === "Eco-Platformer Rescue" && !mission.completed ? "cursor-pointer hover:bg-indigo-500/10 border border-indigo-500/30" : ""}`}
            onClick={() => {
              if (!mission.completed) {
                handleStartMission(mission.id, mission.missionType);
              }
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-200">
                {mission.completed && <ShieldCheck className="h-4 w-4 text-green-400" />}
                {mission.missionType}
                {mission.missionType === "Eco-Platformer Rescue" && !mission.completed && (
                  <span className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 text-xs text-white">Play Now</span>
                )}
              </span>
              <span className="text-muted-foreground">{mission.progress}%</span>
            </div>
            <Progress
              value={mission.progress}
              className="h-2"
              indicatorClassName={mission.completed ? "bg-green-500" : "bg-indigo-500"}
            />
          </div>
        ))}
      </CardContent>
      {isPlatformerOpen && (
        <EcoPlatformer 
          onComplete={handlePlatformerComplete} 
          onClose={() => setIsPlatformerOpen(false)} 
        />
      )}
    </Card>
  );
}
