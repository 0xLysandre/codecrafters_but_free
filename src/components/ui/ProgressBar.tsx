"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  color = "bg-forge-500",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-zinc-400">Progress</span>
          <span className="text-xs font-medium text-zinc-200">
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            color
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
