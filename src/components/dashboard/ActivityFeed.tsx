import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  projectTitle: string;
  projectIcon: string;
  stageTitle: string;
  completedAt: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ActivityFeed({
  activities,
  className,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-[#1e1e2e] bg-[#111118] p-6",
          className
        )}
      >
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-zinc-500 text-center py-4">
          No activity yet. Start a project to begin!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-[#1e1e2e] bg-[#111118] p-6",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-zinc-300 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-zinc-200 truncate">
                <span className="mr-1.5">{activity.projectIcon}</span>
                <span className="font-medium">{activity.stageTitle}</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {activity.projectTitle} &middot;{" "}
                {timeAgo(activity.completedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
