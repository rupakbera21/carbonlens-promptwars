"use client";

import { useEffect, useState, useCallback } from "react";
import { ScoreCard } from "@/presentation/components/dashboard/score-card";
import { CategoryBreakdownCard } from "@/presentation/components/dashboard/category-breakdown";
import { QuickLog } from "@/presentation/components/dashboard/quick-log";
import { TrendChart } from "@/presentation/components/charts/trend-chart";
import { Loading } from "@/presentation/components/common/loading";
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
  const [recommendations, setRecommendations] = useState<
    RecommendationData[]
  >([]);
  const [emissionFactors, setEmissionFactors] = useState<
    Array<{ id: string; subCategory: string; name: string; unit: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(false);
    setScoreData({
      current: {
        score: 75,
        totalCo2eKg: 50,
        breakdown: { transport: 25, energy: 15, food: 10, shopping: 0 },
      },
      explanation: "Good! Your footprint is 25% lower than the weekly average.",
      weeklyHistory: [
        { periodStart: "2024-05-01", totalCo2eKg: 65, score: 68 },
        { periodStart: "2024-05-08", totalCo2eKg: 60, score: 70 },
        { periodStart: "2024-05-15", totalCo2eKg: 50, score: 75 },
      ],
    });
    setGoals([{ id: "g1", targetCo2eKg: 100, status: "active" }]);
    setRecommendations([
      { id: "r1", title: "Take the train instead of flying", description: "You took a flight recently. A train is greener.", potentialSavingKg: 45, priority: "high", category: "transport" },
      { id: "r2", title: "Eat less beef", description: "Replacing two beef meals with poultry saves significant CO₂e.", potentialSavingKg: 12, priority: "medium", category: "food" }
    ]);
    setEmissionFactors([
      { id: "e1", subCategory: "car_petrol", name: "Petrol Car", unit: "km" }
    ]);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogActivity = async (data: {
    category: string;
    subCategory: string;
    quantity: number;
    unit: string;
    emissionFactorId: string;
    activityDate: string;
  }) => {
    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      await fetchData(); // Refresh all data
    }
  };

  if (isLoading) {
    return <Loading text="Loading your dashboard..." />;
  }

  const activeGoal = goals.find((g) => g.status === "active");
  const currentCo2e = scoreData?.current?.totalCo2eKg ?? 0;
  const goalProgress = activeGoal
    ? Math.max(
        0,
        Math.min(100, (1 - currentCo2e / activeGoal.targetCo2eKg) * 100),
      )
    : null;

  // Week-over-week change
  const history = scoreData?.weeklyHistory ?? [];
  const weekChange =
    history.length >= 2
      ? history[history.length - 1].totalCo2eKg -
        history[history.length - 2].totalCo2eKg
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Your carbon footprint at a glance
        </p>
      </div>

      {/* Score + Breakdown + Quick Log */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ScoreCard
          score={scoreData?.current?.score ?? null}
          explanation={
            scoreData?.explanation ?? "Log activities to see your score"
          }
          totalCo2eKg={currentCo2e}
        />
        <CategoryBreakdownCard
          breakdown={scoreData?.current?.breakdown ?? null}
        />
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

      {/* Trends chart + Recommendations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={history} />

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
    </div>
  );
}
