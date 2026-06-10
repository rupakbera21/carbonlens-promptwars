"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { ScoreCard } from "@/presentation/components/dashboard/score-card";
import { CategoryBreakdownCard } from "@/presentation/components/dashboard/category-breakdown";
import { QuickLog } from "@/presentation/components/dashboard/quick-log";
import { TrendChart } from "@/presentation/components/charts/trend-chart";
import { Loading } from "@/presentation/components/common/loading";
import { useGamification } from "@/presentation/providers/gamification-provider";
import dynamic from "next/dynamic";

const LivingCarbonWorld = dynamic(
  () => import("@/presentation/components/dashboard/living-carbon-world").then((mod) => mod.LivingCarbonWorld),
  { ssr: false }
);
import { MissionPanel } from "@/presentation/components/dashboard/mission-panel";
import { CommunityChallengePanel } from "@/presentation/components/dashboard/community-challenge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Progress } from "@/presentation/components/ui/progress";
import type { CategoryBreakdown } from "@/domain/value-objects/carbon-score";
import { Lightbulb, Target, TrendingDown, TrendingUp } from "lucide-react";
import { formatCo2e } from "@/shared/utils/format";

interface ScoreData {
  current: {
    score: number;
    totalCo2eKg: number;
    breakdown: CategoryBreakdown;
  } | null;
  explanation: string;
  weeklyHistory: Array<{
    periodStart: string;
    totalCo2eKg: number;
    score: number;
  }>;
  dailyHistory: Array<{
    periodStart: string;
    totalCo2eKg: number;
    score: number;
  }>;
  hourlyHistory: Array<{
    periodStart: string;
    totalCo2eKg: number;
    score: number;
  }>;
}

interface GoalData {
  id: string;
  targetCo2eKg: number;
  status: string;
}

interface RecommendationData {
  id: string;
  title: string;
  description: string;
  potentialSavingKg: number;
  priority: string;
  category: string;
}

/**
 * Main Dashboard page — the primary view users see after login.
 * Displays score, breakdown, quick-log form, trends, goal progress, and recommendations.
 */
export default function DashboardPage() {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<
    Array<{ id: string; subCategory: string; name: string; unit: string }>
  >([]);
  const [worldState, setWorldState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    isLivingWorldEnabled,
    isDetectiveMissionsEnabled,
    isCommunityChallengesEnabled,
  } = useGamification();

  const [lastAction, setLastAction] = useState<{ type: "positive" | "negative"; timestamp: number } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [scoreRes, goalsRes, recsRes, efRes, worldStateRes] = await Promise.all([
        fetch("/api/scores"),
        fetch("/api/goals"),
        fetch("/api/recommendations"),
        fetch("/api/emission-factors"),
        isLivingWorldEnabled ? fetch("/api/world-state") : Promise.resolve(null),
      ]);

      const [scoreDataRes, goalsDataRes, recsDataRes, efDataRes, worldStateDataRes] =
        await Promise.all([
          scoreRes.ok ? scoreRes.json() : null,
          goalsRes.ok ? goalsRes.json() : { data: [] },
          recsRes.ok ? recsRes.json() : { data: [] },
          efRes.ok ? efRes.json() : { data: [] },
          worldStateRes?.ok ? worldStateRes.json() : null,
        ]);

      setScoreData(scoreDataRes?.data ?? null);
      setGoals(goalsDataRes.data);
      setRecommendations(recsDataRes.data);
      setEmissionFactors(efDataRes.data);
      if (worldStateDataRes?.data) setWorldState(worldStateDataRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLivingWorldEnabled]);

  useEffect(() => {
    fetchData();

    // Set up polling for external world state changes
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Live decaying effect removed per user request

  useEffect(() => {
    const lockout = localStorage.getItem("carbonlens_game_over");
    if (lockout && parseInt(lockout, 10) > Date.now()) {
      setIsGameOver(true);
      signOut({ callbackUrl: "/login" });
    }
  }, []);

  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 4000); // Wait 4s for big bang animation
      return () => clearTimeout(timer);
    }
  }, [isGameOver]);

  // Ensure game over happens if phiScore hits 0 only if they have progressed first
  useEffect(() => {
    if (worldState && worldState.ecoPoints > 0 && worldState.phiScore <= 0 && !isGameOver) {
      setIsGameOver(true);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      localStorage.setItem("carbonlens_game_over", tomorrow.getTime().toString());
    }
  }, [worldState?.phiScore, isGameOver]);

  const handleLogActivity = async (data: {
    category: string;
    subCategory: string;
    quantity: number;
    unit: string;
    emissionFactorId: string;
    activityDate: string;
  }) => {
    // Optimistic Update!
    if (worldState) {
      // Rough estimation for optimistic UI matching GamificationEngine
      const estimatedCo2eKg = data.quantity * (data.category === "energy" ? 0.5 : data.category === "transport" ? 0.2 : 0.1);
      const isPositive = estimatedCo2eKg < 5;
      const impact = isPositive ? 15 : -15; 
      
      let nextPhi = worldState.phiScore + impact;
      
      setWorldState((prev: any) => ({
        ...prev,
        phiScore: Math.max(0, nextPhi),
        airQuality: Math.max(0, Math.min(100, prev.airQuality + (isPositive ? 1 : -3))),
        forestHealth: Math.max(0, Math.min(100, prev.forestHealth + impact)),
        waterQuality: Math.max(0, Math.min(100, prev.waterQuality + impact)),
      }));
      setLastAction({ type: isPositive ? "positive" : "negative", timestamp: Date.now() });
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchData(); // Fetch true server state
    }
  };

  const handleMissionComplete = async (score: number) => {
    if (worldState) {
      setWorldState((prev: any) => ({
        ...prev,
        phiScore: Math.max(0, prev.phiScore + score),
        forestHealth: Math.max(0, Math.min(100, prev.forestHealth + score)),
      }));

      try {
        await fetch("/api/world-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boost: score }),
        });
      } catch (err) {
        console.error("Failed to save mini-game score", err);
      }
    }
  };

  if (isLoading) {
    return <Loading text="Loading your dashboard..." />;
  }

  const activeGoal = goals.find((g) => g.status === "active");
  const currentCo2e = scoreData?.current?.totalCo2eKg ?? 0;
  const goalProgress = activeGoal
    ? Math.max(0, Math.min(100, (1 - currentCo2e / activeGoal.targetCo2eKg) * 100))
    : null;

  // Week-over-week change
  const history = scoreData?.weeklyHistory ?? [];
  const dailyHistory = scoreData?.dailyHistory ?? [];
  const hourlyHistory = scoreData?.hourlyHistory ?? [];
  const weekChange =
    history.length >= 2
      ? history[history.length - 1].totalCo2eKg - history[history.length - 2].totalCo2eKg
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your carbon footprint at a glance</p>
      </div>

      {isLivingWorldEnabled && worldState && (
        <div className="mb-8 relative">
          <LivingCarbonWorld worldState={worldState} lastAction={lastAction} isGameOver={isGameOver} />
          
          {/* Badges System */}
          {worldState.achievements && worldState.achievements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {worldState.achievements.map((ach: any) => (
                <div key={ach.id} className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500 shadow-sm backdrop-blur-sm">
                  <span>{ach.achievementType.includes('Galaxy') ? '🌌' : ach.achievementType.includes('System') ? '☀️' : '🌍'}</span>
                  {ach.achievementType}
                </div>
              ))}
            </div>
          )}
          
          {isGameOver && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-black/80 p-8 text-center backdrop-blur-sm animation-fade-in">
              <h2 className="mb-2 text-3xl font-black text-red-500 tracking-widest">WORLD COLLAPSED</h2>
              <p className="mb-6 text-lg text-slate-300">
                Your Planet Health Index reached 0. The ecosystem can no longer sustain life.
              </p>
              <div className="max-w-md rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-left">
                <h4 className="mb-2 font-semibold text-red-400 text-sm uppercase">How to prevent this</h4>
                <ul className="list-inside list-disc text-sm text-slate-300 space-y-1">
                  <li>Log more plant-based meals</li>
                  <li>Use public transit or carpool</li>
                  <li>Reduce energy consumption at home</li>
                </ul>
              </div>
              <p className="mt-8 text-sm font-medium text-slate-400">
                The simulation will reset tomorrow at midnight.
              </p>
            </div>
          )}
        </div>
      )}

      {isGameOver ? null : (
        <>
          {/* Score + Breakdown + Quick Log */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ScoreCard
          score={scoreData?.current?.score ?? null}
          explanation={scoreData?.explanation ?? "Log activities to see your score"}
          totalCo2eKg={currentCo2e}
        />
        <CategoryBreakdownCard breakdown={scoreData?.current?.breakdown ?? null} />
        <QuickLog
          emissionFactors={emissionFactors}
          onSubmit={handleLogActivity}
          className="md:col-span-2 xl:col-span-1"
        />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Week change */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              {weekChange !== null && weekChange <= 0 ? (
                <TrendingDown className="h-5 w-5 text-carbon-low" />
              ) : (
                <TrendingUp className="h-5 w-5 text-carbon-high" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">vs Last Week</p>
              <p className="text-lg font-semibold tabular-nums">
                {weekChange !== null
                  ? `${weekChange > 0 ? "+" : ""}${formatCo2e(weekChange)}`
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Goal progress */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Goal Progress</p>
              {goalProgress !== null ? (
                <div className="mt-1">
                  <Progress value={goalProgress} className="h-2" />
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {Math.round(goalProgress)}% on track
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No active goal</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Total activities this week */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Recommendations</p>
              <p className="text-lg font-semibold tabular-nums">
                {recommendations.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Score trend */}
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <span className="text-lg font-bold text-primary">
                {scoreData?.current?.score ?? "—"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Carbon Score</p>
              <p className="text-sm font-medium">
                {scoreData?.current?.score !== undefined
                  ? scoreData.current.score >= 70
                    ? "Great job! 🌿"
                    : "Room to improve"
                  : "Start tracking"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Modules Row */}
      {(isDetectiveMissionsEnabled || isCommunityChallengesEnabled) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {isDetectiveMissionsEnabled && <MissionPanel onMissionComplete={handleMissionComplete} />}
          {isCommunityChallengesEnabled && <CommunityChallengePanel />}
        </div>
      )}

      {/* Trends chart + Recommendations */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <TrendChart data={hourlyHistory} />

        {/* Recommendations */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-lg border p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{rec.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {rec.description}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        -{formatCo2e(rec.potentialSavingKg)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Log more activities to receive personalized recommendations
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
}
