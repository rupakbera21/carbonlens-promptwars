"use client";

import { cn } from "@/shared/utils/cn";
import { getScoreColor, getScoreLabel } from "@/shared/utils/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

interface ScoreCardProps {
  score: number | null;
  explanation: string;
  totalCo2eKg: number;
  className?: string;
}

/**
 * ScoreCard — displays the user's carbon score (0-100)
 * with a visual ring indicator and explainable text.
 */
export function ScoreCard({
  score,
  explanation,
  totalCo2eKg,
  className,
}: ScoreCardProps) {
  const displayScore = score ?? 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Carbon Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Score ring */}
        <div
          className="relative flex items-center justify-center"
          role="img"
          aria-label={`Carbon score: ${displayScore} out of 100. ${getScoreLabel(displayScore)}`}
        >
          <svg
            className="h-36 w-36 -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden="true"
          >
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className="text-muted/30"
              strokeWidth="8"
            />
            {/* Score ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className={cn(
                "transition-all duration-1000 ease-out",
                getScoreColor(displayScore),
              )}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className={cn(
                "text-4xl font-bold tabular-nums",
                getScoreColor(displayScore),
              )}
            >
              {displayScore}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Score label */}
        <div className="text-center">
          <p
            className={cn(
              "text-sm font-semibold",
              getScoreColor(displayScore),
            )}
          >
            {getScoreLabel(displayScore)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {explanation}
          </p>
        </div>

        {/* Total emissions */}
        <div className="w-full rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-xs text-muted-foreground">
            Total this period
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {totalCo2eKg >= 1000
              ? `${(totalCo2eKg / 1000).toFixed(1)}t`
              : `${totalCo2eKg.toFixed(1)} kg`}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              CO₂e
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
