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

interface Mission {
  id: string;
  missionType: string;
  progress: number;
  completed: boolean;
}

export function MissionPanel() {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    fetch("/api/missions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setMissions(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

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
          <div key={mission.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-200">
                {mission.completed && <ShieldCheck className="h-4 w-4 text-green-400" />}
                {mission.missionType}
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
    </Card>
  );
}
