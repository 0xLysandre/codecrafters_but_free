"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Flame,
  Trophy,
  Award,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LEVEL_TITLES } from "@/types";

// Demo profile data
const DEMO_PROFILE = {
  username: "forgemaster",
  avatarUrl: null as string | null,
  xp: 1250,
  level: 2,
  currentStreak: 5,
  longestStreak: 12,
  joinedAt: "2024-01-15",
  badges: [
    {
      id: "echo-chamber",
      title: "Echo Chamber",
      description: "Complete Build Echo Server",
      icon: "📡",
      earnedAt: "2024-02-01",
    },
  ],
  completedProjects: [
    {
      projectId: "build-echo-server",
      title: "Build Echo Server",
      icon: "📡",
      language: "python",
      completedAt: "2024-02-01",
    },
  ],
  activityHeatmap: generateDemoHeatmap(),
};

function generateDemoHeatmap() {
  const days: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0;
    days.push({ date: dateStr, count });
  }
  return days;
}

function getHeatmapColor(count: number): string {
  if (count === 0) return "bg-zinc-800/50";
  if (count === 1) return "bg-forge-900/80";
  if (count === 2) return "bg-forge-700/80";
  if (count === 3) return "bg-forge-500/80";
  return "bg-forge-400";
}

export default function ProfilePage() {
  const profile = DEMO_PROFILE;
  const levelTitle = LEVEL_TITLES[profile.level] || "Novice";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="card p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-2xl">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "🔨"
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {profile.username}
              </h1>
              <p className="text-zinc-400 text-sm mt-0.5">
                Level {profile.level} — {levelTitle}
              </p>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Flame className="w-4 h-4 text-ember-400" />
                  <span className="text-zinc-300">
                    {profile.currentStreak} day streak
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-zinc-300">
                    {profile.completedProjects.length} projects
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-300">
                    {profile.badges.length} badges
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-500">
                    Joined{" "}
                    {new Date(profile.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {/* XP Bar */}
              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>{profile.xp} XP</span>
                  <span>1,500 XP (Level 3)</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forge-500 rounded-full transition-all"
                    style={{
                      width: `${((profile.xp - 500) / (1500 - 500)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity Heatmap */}
          <div className="md:col-span-2 card p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4">
              Activity
            </h2>
            <div className="overflow-x-auto">
              <div className="flex gap-[3px] min-w-[700px]">
                {Array.from({ length: 52 }, (_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }, (_, dayIdx) => {
                      const idx = weekIdx * 7 + dayIdx;
                      const day = profile.activityHeatmap[idx];
                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "w-[11px] h-[11px] rounded-[2px]",
                            day ? getHeatmapColor(day.count) : "bg-zinc-800/30"
                          )}
                          title={
                            day
                              ? `${day.date}: ${day.count} stages completed`
                              : ""
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
              <span>Less</span>
              <div className="flex gap-[3px]">
                {[0, 1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={cn("w-[11px] h-[11px] rounded-[2px]", getHeatmapColor(n))}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Badges */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-zinc-400 mb-4">
              Badges ({profile.badges.length})
            </h2>
            {profile.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
                    title={badge.description}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <span className="text-xs text-zinc-400 text-center">
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-4">
                Complete projects to earn badges
              </p>
            )}
          </div>
        </div>

        {/* Completed Projects */}
        <div className="card p-6 mt-6">
          <h2 className="text-sm font-semibold text-zinc-400 mb-4">
            Completed Projects
          </h2>
          {profile.completedProjects.length > 0 ? (
            <div className="space-y-2">
              {profile.completedProjects.map((proj) => (
                <div
                  key={proj.projectId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/20"
                >
                  <span className="text-xl">{proj.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-200">{proj.title}</p>
                    <p className="text-xs text-zinc-500">
                      Completed in {proj.language} on{" "}
                      {new Date(proj.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-4">
              No completed projects yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
