import { Award, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import XPBar from "@/components/ui/XPBar";
import StreakBadge from "@/components/ui/StreakBadge";

interface StatsPanelProps {
  xp: number;
  streak: number;
  badgesEarned: number;
  globalRank: number | null;
  className?: string;
}

export default function StatsPanel({
  xp,
  streak,
  badgesEarned,
  globalRank,
  className,
}: StatsPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#1e1e2e] bg-[#111118] p-6 space-y-6",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-zinc-300">Your Stats</h3>

      {/* XP Bar */}
      <XPBar xp={xp} />

      {/* Streak */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Current Streak</span>
        <StreakBadge count={streak} active={streak > 0} />
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Badges Earned</span>
        <div className="flex items-center gap-1.5 text-sm">
          <Award className="h-4 w-4 text-yellow-400" />
          <span className="font-medium text-zinc-200">{badgesEarned}</span>
        </div>
      </div>

      {/* Global Rank */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Global Rank</span>
        <div className="flex items-center gap-1.5 text-sm">
          <Globe className="h-4 w-4 text-forge-400" />
          <span className="font-medium text-zinc-200">
            {globalRank ? `#${globalRank.toLocaleString()}` : "Unranked"}
          </span>
        </div>
      </div>
    </div>
  );
}
