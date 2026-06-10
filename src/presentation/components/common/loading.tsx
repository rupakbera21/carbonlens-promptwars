"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface LoadingProps {
  className?: string;
  text?: string;
}

/**
 * Loading indicator with accessible text.
 */
export function Loading({ className, text = "Loading..." }: LoadingProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}
      role="status"
      aria-label={text}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
