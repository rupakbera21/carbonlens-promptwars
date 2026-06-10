"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/presentation/components/ui/card";
import { Progress } from "@/presentation/components/ui/progress";
import { Globe, Users } from "lucide-react";
import { formatCo2e } from "@/shared/utils/format";

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
}

export function CommunityChallengePanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setChallenges(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  if (challenges.length === 0) return null;

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-slate-900 to-slate-900/50 shadow-teal-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-teal-400">
          <Globe className="h-5 w-5" />
          Community Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {challenges.map((challenge) => {
          const progress = Math.min(
            100,
            Math.max(0, (challenge.currentValue / challenge.targetValue) * 100),
          );
          return (
            <div key={challenge.id} className="space-y-2">
              <div className="flex flex-col text-sm">
                <span className="text-base font-semibold text-slate-200">
                  {challenge.title}
                </span>
                <span className="mt-1 text-muted-foreground">
                  {challenge.description}
                </span>
              </div>
              <div className="pt-2">
                <div className="mb-2 flex items-end justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-teal-300">
                    <Users className="h-3 w-3" /> {formatCo2e(challenge.currentValue)}
                  </span>
                  <span className="text-muted-foreground">
                    Goal: {formatCo2e(challenge.targetValue)}
                  </span>
                </div>
                <Progress
                  value={progress}
                  className="h-2"
                  indicatorClassName="bg-gradient-to-r from-teal-500 to-emerald-400"
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
