"use client";

import { useEffect, useState } from "react";
import { Loading } from "@/presentation/components/common/loading";
import { TrendChart } from "@/presentation/components/charts/trend-chart";

export default function InsightsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const res = await fetch("/api/scores");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.data?.weeklyHistory ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchScore();
  }, []);

  if (isLoading) return <Loading text="Loading insights..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-muted-foreground">Deep dive into your carbon trends</p>
      </div>
      <div className="grid gap-6">
        <TrendChart data={history} />
      </div>
    </div>
  );
}
