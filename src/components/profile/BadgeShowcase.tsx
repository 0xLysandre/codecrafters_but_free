import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeInfo } from "@/types";

interface BadgeShowcaseProps {
  badges: BadgeInfo[];
  className?: string;
}

export default function BadgeShowcase({
  badges,
  className,
}: BadgeShowcaseProps) {
  if (badges.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <h3 className="text-sm font-semibold text-zinc-300">Badges</h3>
        <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-8 text-center">
          <Star className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-500">
            No badges earned yet. Complete projects to earn badges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-semibold text-zinc-300">
        Badges ({badges.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-2 rounded-xl border border-[#1e1e2e] bg-[#111118] p-4 hover:border-zinc-700 hover:bg-[#15151f] transition-all duration-200"
            title={badge.description}
          >
            <span className="text-3xl">{badge.icon}</span>
            <span className="text-xs font-medium text-zinc-200 text-center">
              {badge.title}
            </span>
            <span className="text-[10px] text-zinc-500">
              {new Date(badge.earnedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
