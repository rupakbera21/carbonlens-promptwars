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
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

interface RadarPoint {
  category: string;
  value: number;
}

interface RadarChartProps {
  data: RadarPoint[];
  className?: string;
}

/**
 * RadarChart — visualizes user's carbon footprint profile across categories.
 * Includes an accessible data table hidden for screen readers (WCAG AA).
 */
export function RadarChart({ data, className }: RadarChartProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Carbon Footprint Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Screen reader table */}
        <table className="sr-only">
          <caption>Carbon emissions by category (Radar Profile)</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>CO₂e (kg)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.category}>
                <td>{point.category}</td>
                <td>{point.value.toFixed(1)} kg</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Visual chart */}
        <div className="h-[200px] w-full" aria-hidden="true" role="presentation">
          {data.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid className="stroke-muted/50" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "currentColor", fontSize: 11, opacity: 0.7 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={{ fill: "currentColor", fontSize: 9, opacity: 0.5 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover p-2 text-popover-foreground shadow-md">
                        <p className="text-xs font-semibold">{d.category}</p>
                        <p className="text-sm font-bold text-primary">
                          {d.value.toFixed(1)} kg CO₂e
                        </p>
                      </div>
                    );
                  }}
                />
                <Radar
                  name="Emissions"
                  dataKey="value"
                  stroke="hsl(152, 60%, 36%)"
                  fill="hsl(152, 60%, 36%)"
                  fillOpacity={0.3}
                />
              </RechartsRadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Log some activities to see your radar profile
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
