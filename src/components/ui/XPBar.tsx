"use client";

import { cn } from "@/lib/utils";
import { getXPProgress, getLevelTitle } from "@/lib/utils";
import ProgressBar from "./ProgressBar";

interface XPBarProps {
  xp: number;
  className?: string;
}

export default function XPBar({ xp, className }: XPBarProps) {
  const { currentLevel, nextLevel, currentLevelXP, nextLevelXP, progress } =
    getXPProgress(xp);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-forge-400">
            Lv.{currentLevel}
          </span>
          <span className="text-sm text-zinc-300">
            {getLevelTitle(currentLevel)}
          </span>
        </div>
        {currentLevel < 10 && (
          <span className="text-xs text-zinc-500">
            Lv.{nextLevel} {getLevelTitle(nextLevel)}
          </span>
        )}
      </div>
      <ProgressBar value={progress} />
      <div className="flex justify-between text-xs text-zinc-500">
        <span>{xp.toLocaleString()} XP</span>
        {currentLevel < 10 && (
          <span>{nextLevelXP.toLocaleString()} XP</span>
        )}
      </div>
    </div>
  );
}
