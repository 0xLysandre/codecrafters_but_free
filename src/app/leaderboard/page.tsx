"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Trophy,
  Flame,
  Medal,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL_TITLES } from "@/types";

const DEMO_LEADERBOARD = Array.from({ length: 25 }, (_, i) => ({
  rank: i + 1,
  userId: `user-${i + 1}`,
  username: [
    "bytecrusher",
    "rustacean42",
    "socketqueen",
    "gitmaster",
    "forgeborn",
    "shellshock",
    "tcpwizard",
    "parserpro",
    "codesmith",
    "dockerdude",
    "kernelhack",
    "netrunner",
    "bitmancer",
    "loopbreaker",
    "stackforge",
    "devnull",
    "syscaller",
    "pipedream",
    "hashking",
    "bufferzone",
    "memalloc",
    "forkbomb",
    "nullpointer",
    "segfault",
    "coreDumper",
  ][i],
  avatarUrl: null as string | null,
  xp: Math.max(80000 - i * 3200 + Math.floor(Math.random() * 500), 100),
  level: Math.max(10 - Math.floor(i / 3), 1),
  projectsCompleted: Math.max(15 - Math.floor(i / 2), 0),
  currentStreak: Math.max(30 - i * 2 + Math.floor(Math.random() * 5), 0),
}));

type SortBy = "xp" | "projects" | "streak";
type TimeFilter = "all" | "monthly" | "weekly";

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortBy>("xp");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const sorted = [...DEMO_LEADERBOARD].sort((a, b) => {
    if (sortBy === "xp") return b.xp - a.xp;
    if (sortBy === "projects") return b.projectsCompleted - a.projectsCompleted;
    return b.currentStreak - a.currentStreak;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-forge-400" />
            <span className="font-bold text-white">Leaderboard</span>
          </div>
          <div className="w-20" />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Top 3 */}
        <div className="flex items-end justify-center gap-4 mb-10 pt-4">
          {[sorted[1], sorted[0], sorted[2]].map((user, idx) => {
            const position = [2, 1, 3][idx];
            const heights = ["h-28", "h-36", "h-24"];
            const colors = [
              "from-zinc-400 to-zinc-500",
              "from-yellow-400 to-yellow-600",
              "from-amber-600 to-amber-700",
            ];
            return (
              <div
                key={user.userId}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-lg mb-2">
                  {position === 1 ? "👑" : "🔨"}
                </div>
                <p className="text-sm font-medium text-white mb-0.5">
                  {user.username}
                </p>
                <p className="text-xs text-forge-400 mb-2">
                  {user.xp.toLocaleString()} XP
                </p>
                <div
                  className={cn(
                    "w-24 rounded-t-lg bg-gradient-to-b flex items-center justify-center text-2xl font-bold text-white/80",
                    heights[idx],
                    colors[idx]
                  )}
                >
                  #{position}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {(["all", "monthly", "weekly"] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-colors capitalize",
                  timeFilter === f
                    ? "bg-forge-500/20 text-forge-400 border border-forge-500/30"
                    : "text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                )}
              >
                {f === "all" ? "All Time" : f}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {([
              ["xp", "XP"],
              ["projects", "Projects"],
              ["streak", "Streak"],
            ] as [SortBy, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg transition-colors",
                  sortBy === key
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left p-4 w-16">Rank</th>
                <th className="text-left p-4">User</th>
                <th className="text-right p-4">XP</th>
                <th className="text-right p-4">Level</th>
                <th className="text-right p-4">Projects</th>
                <th className="text-right p-4">Streak</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((user, idx) => (
                <tr
                  key={user.userId}
                  className={cn(
                    "border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors",
                    idx < 3 && "bg-yellow-500/[0.02]"
                  )}
                >
                  <td className="p-4">
                    <span
                      className={cn(
                        "text-sm font-mono",
                        idx === 0
                          ? "text-yellow-400"
                          : idx === 1
                            ? "text-zinc-300"
                            : idx === 2
                              ? "text-amber-600"
                              : "text-zinc-500"
                      )}
                    >
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-zinc-200 font-medium">
                        {user.username}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-forge-400 font-mono">
                      {user.xp.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs text-zinc-400">
                      {user.level} — {LEVEL_TITLES[user.level]}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-zinc-300">
                      {user.projectsCompleted}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-ember-400 flex items-center justify-end gap-1">
                      {user.currentStreak > 0 && (
                        <Flame className="w-3.5 h-3.5" />
                      )}
                      {user.currentStreak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
