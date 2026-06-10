"use client";

import { useTheme } from "@/presentation/providers/theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Label } from "@/presentation/components/ui/label";
import { Sun, Moon, Monitor, Eye, Zap, Download, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useState } from "react";

/**
 * Settings page — user preferences, accessibility, and GDPR controls.
 */
export default function SettingsPage() {
  const {
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
  } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/user/export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carbonlens-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    await fetch("/api/user/delete", { method: "DELETE" });
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and data</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm">Theme</Label>
            <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
              {[
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    theme === value && "border-primary bg-primary/5 font-medium",
                  )}
                  role="radio"
                  aria-checked={theme === value}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>WCAG 2.2 AA compliant options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>High Contrast</Label>
                <p className="text-xs text-muted-foreground">7:1 contrast ratio</p>
              </div>
            </div>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                highContrast ? "bg-primary" : "bg-muted",
              )}
              role="switch"
              aria-checked={highContrast}
              aria-label="Toggle high contrast mode"
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  highContrast ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label>Reduced Motion</Label>
                <p className="text-xs text-muted-foreground">Disable all animations</p>
              </div>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                reducedMotion ? "bg-primary" : "bg-muted",
              )}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Toggle reduced motion"
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  reducedMotion ? "translate-x-5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>GDPR-compliant data management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export My Data"}
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete My Account
            </Button>
          ) : (
            <div className="rounded-lg border border-destructive p-4">
              <p className="text-sm font-medium text-destructive">
                This will permanently delete your account and all data. This cannot be
                undone.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Confirm Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
