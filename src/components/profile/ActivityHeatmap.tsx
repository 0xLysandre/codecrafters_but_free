"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ActivityDay } from "@/types";

interface ActivityHeatmapProps {
  activityData: ActivityDay[];
  className?: string;
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-zinc-800/50";
  if (count <= 1) return "bg-forge-900";
  if (count <= 3) return "bg-forge-700";
  if (count <= 5) return "bg-forge-500";
  return "bg-forge-400";
}

const WEEKS = 52;
const DAYS_PER_WEEK = 7;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ActivityHeatmap({
  activityData,
  className,
}: ActivityHeatmapProps) {
  const { grid, monthPositions } = useMemo(() => {
    const activityMap = new Map<string, number>();
    activityData.forEach((day) => activityMap.set(day.date, day.count));

    const today = new Date();
    const weeks: { date: string; count: number }[][] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;

    for (let w = WEEKS - 1; w >= 0; w--) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const dateStr = date.toISOString().split("T")[0];
        const month = date.getMonth();

        if (month !== lastMonth) {
          months.push({ label: MONTH_LABELS[month], col: WEEKS - 1 - w });
          lastMonth = month;
        }

        week.push({
          date: dateStr,
          count: activityMap.get(dateStr) ?? 0,
        });
      }
      weeks.push(week);
    }

    return { grid: weeks, monthPositions: months };
  }, [activityData]);

  const totalContributions = activityData.reduce(
    (sum, day) => sum + day.count,
    0
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Activity</h3>
        <span className="text-xs text-zinc-500">
          {totalContributions} contributions in the last year
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {monthPositions.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-zinc-500"
                style={{
                  position: "relative",
                  left: `${m.col * 14}px`,
                  marginRight: i < monthPositions.length - 1
                    ? `${((monthPositions[i + 1]?.col ?? m.col) - m.col) * 14 - 24}px`
                    : 0,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="text-[10px] text-zinc-500 h-[12px] leading-[12px]"
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Grid */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                    className={cn(
                      "h-[12px] w-[12px] rounded-sm transition-colors",
                      getIntensity(day.count)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[10px] text-zinc-500 mr-1">Less</span>
            <div className="h-[10px] w-[10px] rounded-sm bg-zinc-800/50" />
            <div className="h-[10px] w-[10px] rounded-sm bg-forge-900" />
            <div className="h-[10px] w-[10px] rounded-sm bg-forge-700" />
            <div className="h-[10px] w-[10px] rounded-sm bg-forge-500" />
            <div className="h-[10px] w-[10px] rounded-sm bg-forge-400" />
            <span className="text-[10px] text-zinc-500 ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
