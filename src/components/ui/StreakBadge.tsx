"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  count: number;
  active?: boolean;
  className?: string;
}

export default function StreakBadge({
  count,
  active = false,
  className,
}: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
        "border",
        active
          ? "border-ember-500/40 bg-ember-500/10 text-ember-400"
          : "border-zinc-700 bg-zinc-800/50 text-zinc-500",
        className
      )}
    >
      <Flame
        className={cn(
          "h-4 w-4",
          active && "animate-pulse text-ember-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]"
        )}
      />
      <span className="text-sm font-bold">{count}</span>
      <span className="text-xs opacity-70">day{count !== 1 ? "s" : ""}</span>
    </div>
  );
}
