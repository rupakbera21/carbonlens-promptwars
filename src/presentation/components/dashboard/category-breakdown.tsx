"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { cn } from "@/shared/utils/cn";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/shared/constants/categories";
import { formatCo2e } from "@/shared/utils/format";
import type { CategoryBreakdown } from "@/domain/value-objects/carbon-score";
import { Car, Zap, Utensils, ShoppingBag } from "lucide-react";

const CATEGORY_ICON_MAP = {
  transport: Car,
  energy: Zap,
  food: Utensils,
  shopping: ShoppingBag,
} as const;

interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdown | null;
  className?: string;
}

/**
 * CategoryBreakdown — shows per-category CO₂e with visual bars.
 * Information is NOT conveyed by color alone (icons + text labels).
 */
export function CategoryBreakdownCard({
  breakdown,
  className,
}: CategoryBreakdownCardProps) {
  const data = breakdown ?? {
    transport: 0,
    energy: 0,
    food: 0,
    shopping: 0,
  };
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  const categories = (Object.entries(data) as [keyof CategoryBreakdown, number][]).sort(
    ([, a], [, b]) => b - a,
  );

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Emissions by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Accessible data table (hidden visually, available to screen readers) */}
        <table className="sr-only">
          <caption>Carbon emissions breakdown by category</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>CO₂e</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(([cat, value]) => (
              <tr key={cat}>
                <td>{CATEGORY_LABELS[cat]}</td>
                <td>{formatCo2e(value)}</td>
                <td>{total > 0 ? Math.round((value / total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Visual bars */}
        <div className="space-y-4" aria-hidden="true">
          {categories.map(([cat, value]) => {
            const Icon = cat in CATEGORY_ICON_MAP ? CATEGORY_ICON_MAP[cat as keyof typeof CATEGORY_ICON_MAP] : null;
            const percent = total > 0 ? (value / total) * 100 : 0;
            const label = cat in CATEGORY_LABELS ? CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] : cat;
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium">{label}</span>
                  </div>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCo2e(value)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(percent, 1)}%`,
                      backgroundColor: CATEGORY_COLORS[cat],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {total === 0 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No activities logged yet. Start tracking to see your breakdown!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
