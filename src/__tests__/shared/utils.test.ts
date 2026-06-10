import { describe, it, expect } from "vitest";
import {
  formatCo2e,
  formatPercent,
  getScoreLabel,
  getScoreColor,
} from "@/shared/utils/format";
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  formatDate,
  daysBetween,
} from "@/shared/utils/date";

describe("formatCo2e", () => {
  it("should format values >= 1000 as tonnes", () => {
    expect(formatCo2e(1500)).toBe("1.5t");
  });

  it("should format values >= 10 as rounded kg", () => {
    expect(formatCo2e(25)).toBe("25 kg");
  });

  it("should format small values with 1 decimal", () => {
    expect(formatCo2e(5.7)).toBe("5.7 kg");
  });
});

describe("formatPercent", () => {
  it("should round to nearest integer", () => {
    expect(formatPercent(75.6)).toBe("76%");
  });
});

describe("getScoreLabel", () => {
  it("should return correct labels for score ranges", () => {
    expect(getScoreLabel(95)).toBe("Excellent");
    expect(getScoreLabel(75)).toBe("Good");
    expect(getScoreLabel(55)).toBe("Average");
    expect(getScoreLabel(35)).toBe("Fair");
    expect(getScoreLabel(15)).toBe("Needs Work");
  });
});

describe("getScoreColor", () => {
  it("should return color classes for score ranges", () => {
    expect(getScoreColor(80)).toBe("text-carbon-low");
    expect(getScoreColor(55)).toBe("text-carbon-medium");
    expect(getScoreColor(35)).toBe("text-carbon-high");
    expect(getScoreColor(10)).toBe("text-carbon-critical");
  });
});

describe("Date utilities", () => {
  it("getWeekStart should return Monday", () => {
    // 2024-01-17 is a Wednesday
    const date = new Date("2024-01-17T12:00:00Z");
    const weekStart = getWeekStart(date);
    expect(weekStart.getUTCDay()).toBe(1); // Monday
    expect(weekStart.getUTCDate()).toBe(15);
  });

  it("getWeekEnd should return Sunday", () => {
    const date = new Date("2024-01-17T12:00:00Z");
    const weekEnd = getWeekEnd(date);
    expect(weekEnd.getUTCDay()).toBe(0); // Sunday
  });

  it("getMonthStart should return first day", () => {
    const date = new Date("2024-01-17T12:00:00Z");
    const monthStart = getMonthStart(date);
    expect(monthStart.getUTCDate()).toBe(1);
  });

  it("getMonthEnd should return last day", () => {
    const date = new Date("2024-01-17T12:00:00Z");
    const monthEnd = getMonthEnd(date);
    expect(monthEnd.getUTCDate()).toBe(31);
  });

  it("formatDate should return YYYY-MM-DD", () => {
    const date = new Date("2024-01-17T12:00:00Z");
    expect(formatDate(date)).toBe("2024-01-17");
  });

  it("daysBetween should calculate correct days", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-01-31");
    expect(daysBetween(start, end)).toBe(30);
  });
});
