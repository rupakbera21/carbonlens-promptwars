"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { cn } from "@/shared/utils/cn";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TrendPoint {
  periodStart: string;
  totalCo2eKg: number;
  score: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  className?: string;
}

/**
 * TrendChart — visualizes hourly CO₂e trends as an area chart.
 * Includes an accessible data table hidden for screen readers.
 */
export function TrendChart({ data, className }: TrendChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: new Date(point.periodStart).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  }));

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Hourly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Screen reader table */}
        <table className="sr-only">
          <caption>Hourly carbon emissions trend</caption>
          <thead>
            <tr>
              <th>Time</th>
              <th>CO₂e (kg)</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((point) => (
              <tr key={point.periodStart}>
                <td>{point.label}</td>
                <td>{point.totalCo2eKg.toFixed(1)} kg</td>
                <td>{point.score}/100</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Visual chart */}
        <div className="h-[200px] w-full" aria-hidden="true" role="presentation">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="co2eGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 60%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152, 60%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}t` : `${v}kg`
                  }
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover p-2 shadow-md">
                        <p className="text-xs font-medium">{d.label}</p>
                        <p className="text-sm">{d.totalCo2eKg.toFixed(1)} kg CO₂e</p>
                        <p className="text-xs text-muted-foreground">
                          Score: {d.score}/100
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalCo2eKg"
                  stroke="hsl(152, 60%, 36%)"
                  fill="url(#co2eGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Not enough data to show trends yet
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
