"use client";

import { useEffect, useState } from "react";
import { formatCo2e } from "@/shared/utils/format";
import { Loading } from "@/presentation/components/common/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Target } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGoals() {
      try {
        const res = await fetch("/api/goals");
        if (res.ok) {
          const data = await res.json();
          setGoals(data.data ?? []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGoals();
  }, []);

  if (isLoading) return <Loading text="Loading goals..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Goals</h1>
        <p className="text-muted-foreground">Manage your carbon reduction targets</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {goals.length > 0 ? (
          goals.map((g) => (
            <Card key={g.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  {g.periodType === "monthly" ? "Monthly Target" : "Weekly Target"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground">Target limit</p>
                    <p className="text-2xl font-bold">{formatCo2e(g.targetCo2eKg)}</p>
                  </div>
                  <div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                      {g.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            You don't have any active goals right now.
          </div>
        )}
      </div>
    </div>
  );
}
