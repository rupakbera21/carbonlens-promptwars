"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { signOut } from "next-auth/react";
import { ScoreCard } from "@/presentation/components/dashboard/score-card";
import { CategoryBreakdownCard } from "@/presentation/components/dashboard/category-breakdown";
import { QuickLog } from "@/presentation/components/dashboard/quick-log";
import { Loading } from "@/presentation/components/common/loading";
import { useGamification } from "@/presentation/providers/gamification-provider";
import dynamic from "next/dynamic";

const TrendChart = dynamic(
  () =>
    import("@/presentation/components/charts/trend-chart").then((mod) => mod.TrendChart),
  { ssr: false },
);

const RadarChart = dynamic(
  () =>
    import("@/presentation/components/charts/radar-chart").then((mod) => mod.RadarChart),
  { ssr: false },
);

const LivingCarbonWorld = dynamic(
  () =>
    import("@/presentation/components/dashboard/living-carbon-world").then(
      (mod) => mod.LivingCarbonWorld,
    ),
  { ssr: false },
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
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    isLivingWorldEnabled,
    isDetectiveMissionsEnabled,
    isCommunityChallengesEnabled,
  } = useGamification();

  const [lastAction, setLastAction] = useState<{
    type: "positive" | "negative";
    timestamp: number;
  } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // localStorage key for persisting world state scores so they never reset to 0
  const LS_KEY = "carbonlens_world_state_v2";

  const loadLocalState = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const saveLocalState = (state: any) => {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          phiScore: state.phiScore,
          ecoPoints: state.ecoPoints,
          forestHealth: state.forestHealth,
          waterQuality: state.waterQuality,
          airQuality: state.airQuality,
          biodiversity: state.biodiversity,
          level: state.level,
        }),
      );
    } catch {
      /* noop */
    }
  };

  // Merge server response with local cache — always keep the HIGHER value
  const mergeWithLocal = (serverState: any) => {
    const local = loadLocalState();
    if (!local) {
      saveLocalState(serverState);
      return serverState;
    }
    const merged = {
      ...serverState,
      phiScore: Math.max(serverState.phiScore ?? 0, local.phiScore ?? 0),
      ecoPoints: Math.max(serverState.ecoPoints ?? 0, local.ecoPoints ?? 0),
      forestHealth: Math.max(serverState.forestHealth ?? 0, local.forestHealth ?? 0),
      waterQuality: Math.max(serverState.waterQuality ?? 0, local.waterQuality ?? 0),
      airQuality: Math.max(serverState.airQuality ?? 0, local.airQuality ?? 0),
      biodiversity: Math.max(serverState.biodiversity ?? 0, local.biodiversity ?? 0),
    };
    saveLocalState(merged);
    return merged;
  };

  // Fetch world state ONCE on mount — never poll it, never overwrite with server data
  const fetchWorldState = useCallback(async () => {
    const local = loadLocalState();
    try {
      if (!isLivingWorldEnabled) return;
      const res = await fetch("/api/world-state");
      if (res.ok) {
        const json = await res.json();
        const serverState = json?.data;
        if (serverState) {
          // If local has a higher score, keep it — server can only win if higher
          const merged = local
            ? {
                ...serverState,
                phiScore: Math.max(serverState.phiScore ?? 0, local.phiScore ?? 0),
                ecoPoints: Math.max(serverState.ecoPoints ?? 0, local.ecoPoints ?? 0),
                forestHealth: Math.max(
                  serverState.forestHealth ?? 0,
                  local.forestHealth ?? 0,
                ),
                waterQuality: Math.max(
                  serverState.waterQuality ?? 0,
                  local.waterQuality ?? 0,
                ),
                airQuality: Math.max(serverState.airQuality ?? 0, local.airQuality ?? 0),
                biodiversity: Math.max(
                  serverState.biodiversity ?? 0,
                  local.biodiversity ?? 0,
                ),
              }
            : serverState;
          saveLocalState(merged);
          setWorldState(merged);
          return;
        }
      }
    } catch {
      /* noop */
    }
    // Fallback: use localStorage if server fails
    if (local) setWorldState(local);
  }, [isLivingWorldEnabled]);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/activities?pageSize=500");
      if (res.ok) {
        const json = await res.json();
        setActivities(json.data ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  }, []);

  // Poll only scores/goals/recommendations — NOT worldState
  const fetchData = useCallback(async () => {
    try {
      const [scoreRes, goalsRes, recsRes, efRes] = await Promise.all([
        fetch("/api/scores"),
        fetch("/api/goals"),
        fetch("/api/recommendations"),
        fetch("/api/emission-factors"),
      ]);

      const [scoreDataRes, goalsDataRes, recsDataRes, efDataRes] = await Promise.all([
        scoreRes.ok ? scoreRes.json() : null,
        goalsRes.ok ? goalsRes.json() : { data: [] },
        recsRes.ok ? recsRes.json() : { data: [] },
        efRes.ok ? efRes.json() : { data: [] },
      ]);

      setScoreData(scoreDataRes?.data ?? null);
      setGoals(goalsDataRes.data);
      setRecommendations(recsDataRes.data);
      setEmissionFactors(efDataRes.data);
      // NOTE: worldState is intentionally NOT fetched here
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load: fetch everything
    fetchData();
    fetchWorldState(); // World state fetched ONCE only
    fetchActivities(); // Fetch activities list for Radar Chart

    // Poll scores/goals/recs every 30s — worldState excluded from polling
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData, fetchWorldState, fetchActivities]);

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
    if (
      worldState &&
      worldState.ecoPoints > 0 &&
      worldState.phiScore <= 0 &&
      !isGameOver
    ) {
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
      // Dynamic optimistic UI matching GamificationEngine
      const baselines: Record<string, number> = {
        transport: 15,
        energy: 20,
        food: 10,
        waste: 5,
      };
      const category = data.category.toLowerCase();
      const baseline = baselines[category] || 10;

      const estimatedCo2eKg =
        data.quantity *
        (category === "energy" ? 0.5 : category === "transport" ? 0.2 : 0.1);
      const difference = baseline - estimatedCo2eKg;
      let impact = difference * 0.5;
      impact = Math.max(-60, Math.min(40, impact));
      const isPositive = impact > 0;

      let nextPhi = worldState.phiScore + impact;

      setWorldState((prev: any) => {
        const next = {
          ...prev,
          phiScore: Math.max(0, nextPhi),
          airQuality: Math.max(0, Math.min(100, prev.airQuality + (isPositive ? 1 : -3))),
          forestHealth: Math.max(0, Math.min(100, prev.forestHealth + impact)),
          waterQuality: Math.max(0, Math.min(100, prev.waterQuality + impact)),
        };
        saveLocalState(next); // Always persist to localStorage
        return next;
      });
      setLastAction({
        type: isPositive ? "positive" : "negative",
        timestamp: Date.now(),
      });
    }

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      // Only refresh scores/goals — NOT worldState (it's managed locally)
      const [scoreRes] = await Promise.all([fetch("/api/scores"), fetchActivities()]);
      if (scoreRes.ok) {
        const scoreDataRes = await scoreRes.json();
        setScoreData(scoreDataRes?.data ?? null);
      }
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

  // Radar Chart profile data
  const radarData = useMemo(() => {
    const totals: Record<string, number> = {
      transport: 0,
      energy: 0,
      food: 0,
      shopping: 0,
    };
    for (const act of activities) {
      const cat = act.category.toLowerCase();
      if (cat in totals) {
        totals[cat] += act.co2eKg;
      }
    }
    return [
      { category: "Transport", value: Math.round(totals.transport * 10) / 10 },
      { category: "Energy", value: Math.round(totals.energy * 10) / 10 },
      { category: "Food", value: Math.round(totals.food * 10) / 10 },
      { category: "Shopping", value: Math.round(totals.shopping * 10) / 10 },
    ];
  }, [activities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your carbon footprint at a glance</p>
      </div>

      {isLivingWorldEnabled && worldState && (
        <div className="relative mb-8">
          <LivingCarbonWorld
            worldState={worldState}
            lastAction={lastAction}
            isGameOver={isGameOver}
          />

          {/* Badges System */}
          {worldState.achievements && worldState.achievements.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {worldState.achievements.map((ach: any) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-500 shadow-sm backdrop-blur-sm"
                >
                  <span>
                    {ach.achievementType.includes("Galaxy")
                      ? "🌌"
                      : ach.achievementType.includes("System")
                        ? "☀️"
                        : "🌍"}
                  </span>
                  {ach.achievementType}
                </div>
              ))}
            </div>
          )}

          {isGameOver && (
            <div className="animation-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center rounded-xl bg-black/80 p-8 text-center backdrop-blur-sm">
              <h2 className="mb-2 text-3xl font-black tracking-widest text-red-500">
                WORLD COLLAPSED
              </h2>
              <p className="mb-6 text-lg text-slate-300">
                Your Planet Health Index reached 0. The ecosystem can no longer sustain
                life.
              </p>
              <div className="max-w-md rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-left">
                <h4 className="mb-2 text-sm font-semibold uppercase text-red-400">
                  How to prevent this
                </h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
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
              {isDetectiveMissionsEnabled && (
                <MissionPanel onMissionComplete={handleMissionComplete} />
              )}
              {isCommunityChallengesEnabled && <CommunityChallengePanel />}
            </div>
          )}

          {/* Trends chart + Radar chart + Recommendations */}
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <TrendChart data={hourlyHistory} />
            <RadarChart data={radarData} />

            {/* Recommendations */}
            <Card className="md:col-span-2 xl:col-span-1">
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
