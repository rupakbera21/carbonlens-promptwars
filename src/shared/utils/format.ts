/**
 * Formatting utilities for display values.
 */

/** Format CO₂e in kg or tonnes with appropriate precision */
export function formatCo2e(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}t`;
  }
  if (kg >= 10) {
    return `${Math.round(kg)} kg`;
  }
  return `${kg.toFixed(1)} kg`;
}

/** Format a percentage (0-100) */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

/** Format a number with locale-aware separators */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Get a score label from a 0-100 score */
export function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  if (score >= 30) return "Fair";
  return "Needs Work";
}

/** Get a score color class from a 0-100 score */
export function getScoreColor(score: number): string {
  if (score >= 70) return "text-carbon-low";
  if (score >= 50) return "text-carbon-medium";
  if (score >= 30) return "text-carbon-high";
  return "text-carbon-critical";
}
