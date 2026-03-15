"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Terminal,
  Globe,
  Database,
  GitBranch,
  Container,
  HardDrive,
  Network,
  Braces,
  Regex,
  Share2,
  MessageSquare,
  Cpu,
  Radio,
  Link2,
  Lock,
  Flame,
  Trophy,
  Award,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/types";

interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  icon: string;
  stageCount: number;
  completedStages: number;
  isLocked: boolean;
  concepts: string[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  radio: Radio,
  terminal: Terminal,
  link2: Link2,
  globe: Globe,
  database: Database,
  network: Network,
  braces: Braces,
  "git-branch": GitBranch,
  container: Container,
  "hard-drive": HardDrive,
  regex: Regex,
  share2: Share2,
  "message-square": MessageSquare,
  cpu: Cpu,
  code2: Code2,
};

// Demo data for the dashboard
const DEMO_PROJECTS: ProjectData[] = [
  {
    id: "build-echo-server",
    title: "Build Your Own Echo Server",
    slug: "echo-server",
    description:
      "Build a TCP echo server that accepts connections and echoes data back to clients.",
    difficulty: "beginner",
    estimatedHours: 6,
    icon: "radio",
    stageCount: 8,
    completedStages: 0,
    isLocked: false,
    concepts: ["TCP sockets", "I/O", "Concurrency"],
  },
  {
    id: "build-shell",
    title: "Build Your Own Shell",
    slug: "shell",
    description:
      "Build a Unix shell that can parse commands, execute programs, and handle pipes.",
    difficulty: "beginner",
    estimatedHours: 10,
    icon: "terminal",
    stageCount: 12,
    completedStages: 0,
    isLocked: false,
    concepts: ["Processes", "Syscalls", "Pipes", "Signals"],
  },
  {
    id: "build-url-shortener",
    title: "Build Your Own URL Shortener",
    slug: "url-shortener",
    description:
      "Build a URL shortener service with HTTP API and persistent storage.",
    difficulty: "beginner",
    estimatedHours: 5,
    icon: "link2",
    stageCount: 8,
    completedStages: 0,
    isLocked: false,
    concepts: ["HTTP", "Routing", "JSON", "Persistence"],
  },
  {
    id: "build-http-server",
    title: "Build Your Own HTTP Server",
    slug: "http-server",
    description:
      "Build an HTTP/1.1 server with routing, static files, compression, and keep-alive.",
    difficulty: "intermediate",
    estimatedHours: 12,
    icon: "globe",
    stageCount: 14,
    completedStages: 0,
    isLocked: true,
    concepts: ["HTTP/1.1", "Content negotiation", "Compression"],
  },
  {
    id: "build-redis",
    title: "Build Your Own Redis",
    slug: "redis",
    description:
      "Build a Redis-compatible in-memory key-value store with RESP protocol.",
    difficulty: "intermediate",
    estimatedHours: 12,
    icon: "database",
    stageCount: 16,
    completedStages: 0,
    isLocked: true,
    concepts: ["RESP protocol", "TTL", "Pub/Sub", "Persistence"],
  },
  {
    id: "build-dns-resolver",
    title: "Build Your Own DNS Resolver",
    slug: "dns-resolver",
    description:
      "Build a DNS resolver that handles queries, caching, and recursive resolution.",
    difficulty: "intermediate",
    estimatedHours: 8,
    icon: "network",
    stageCount: 10,
    completedStages: 0,
    isLocked: true,
    concepts: ["DNS protocol", "Binary parsing", "UDP", "Caching"],
  },
  {
    id: "build-json-parser",
    title: "Build Your Own JSON Parser",
    slug: "json-parser",
    description:
      "Build a JSON parser with lexing, recursive descent parsing, and error reporting.",
    difficulty: "intermediate",
    estimatedHours: 8,
    icon: "braces",
    stageCount: 10,
    completedStages: 0,
    isLocked: true,
    concepts: ["Lexing", "Parsing", "Recursive descent"],
  },
  {
    id: "build-git",
    title: "Build Your Own Git",
    slug: "git",
    description:
      "Build Git with SHA-1 hashing, blob/tree/commit objects, and HTTP cloning.",
    difficulty: "advanced",
    estimatedHours: 16,
    icon: "git-branch",
    stageCount: 16,
    completedStages: 0,
    isLocked: true,
    concepts: ["SHA-1", "Content-addressable storage", "Packfiles"],
  },
  {
    id: "build-docker",
    title: "Build Your Own Docker",
    slug: "docker",
    description:
      "Build Docker with Linux namespaces, cgroups, and container image layers.",
    difficulty: "advanced",
    estimatedHours: 14,
    icon: "container",
    stageCount: 12,
    completedStages: 0,
    isLocked: true,
    concepts: ["Namespaces", "Cgroups", "Container images"],
  },
];

const TIER_LABELS: Record<Difficulty, string> = {
  beginner: "Tier 1 — Beginner",
  intermediate: "Tier 2 — Intermediate",
  advanced: "Tier 3 — Advanced",
  expert: "Tier 4 — Expert",
};

export default function DashboardPage() {
  const [userXP] = useState(0);
  const [streak] = useState(0);

  const projectsByTier = DEMO_PROJECTS.reduce(
    (acc, project) => {
      if (!acc[project.difficulty]) acc[project.difficulty] = [];
      acc[project.difficulty].push(project);
      return acc;
    },
    {} as Record<Difficulty, ProjectData[]>
  );

  const tiers: Difficulty[] = ["beginner", "intermediate", "advanced", "expert"];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Nav */}
      <nav className="border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forge-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">CodeForge</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-zinc-200 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/leaderboard"
              className="text-zinc-400 hover:text-zinc-200 text-sm transition-colors"
            >
              Leaderboard
            </Link>
            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-zinc-800">
              <div className="flex items-center gap-1 text-ember-400 text-sm">
                <Flame className="w-4 h-4" />
                <span>{streak}</span>
              </div>
              <div className="text-forge-400 text-sm font-medium">
                {userXP} XP
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              Project Map
            </h1>
            <p className="text-zinc-400 mb-8">
              Choose a project to start building. Complete beginner projects to
              unlock more.
            </p>

            {tiers.map((tier) => {
              const projects = projectsByTier[tier];
              if (!projects || projects.length === 0) return null;

              return (
                <div key={tier} className="mb-10">
                  <h2
                    className={cn(
                      "text-sm font-semibold uppercase tracking-wider mb-4",
                      DIFFICULTY_CONFIG[tier].color
                    )}
                  >
                    {TIER_LABELS[tier]}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => {
                      const IconComponent =
                        ICON_MAP[project.icon] || Code2;
                      const progress =
                        project.stageCount > 0
                          ? (project.completedStages / project.stageCount) *
                            100
                          : 0;

                      return (
                        <Link
                          key={project.id}
                          href={
                            project.isLocked
                              ? "#"
                              : `/projects/${project.slug}`
                          }
                          className={cn(
                            "card p-5 transition-all duration-200 group relative",
                            project.isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:border-forge-500/30 cursor-pointer"
                          )}
                        >
                          {project.isLocked && (
                            <div className="absolute top-3 right-3">
                              <Lock className="w-4 h-4 text-zinc-600" />
                            </div>
                          )}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                DIFFICULTY_CONFIG[project.difficulty].bgColor
                              )}
                            >
                              <IconComponent
                                className={cn(
                                  "w-5 h-5",
                                  DIFFICULTY_CONFIG[project.difficulty].color
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="text-white font-medium text-sm">
                                {project.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded",
                                    DIFFICULTY_CONFIG[project.difficulty]
                                      .bgColor,
                                    DIFFICULTY_CONFIG[project.difficulty].color
                                  )}
                                >
                                  {
                                    DIFFICULTY_CONFIG[project.difficulty]
                                      .label
                                  }
                                </span>
                                <span className="text-xs text-zinc-500">
                                  ~{project.estimatedHours}h
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-zinc-400 text-xs mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-zinc-500">
                              {project.completedStages}/{project.stageCount}{" "}
                              stages
                            </span>
                            {progress > 0 && (
                              <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-forge-500 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            )}
                            {!project.isLocked && progress === 0 && (
                              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-forge-400 transition-colors" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="w-72 hidden lg:block space-y-4">
            {/* Stats */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Your Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-zinc-300">Level 1 — Novice</span>
                    <span className="text-forge-400">{userXP} XP</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forge-500 rounded-full"
                      style={{ width: `${(userXP / 500) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {500 - userXP} XP to Level 2
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Flame className="w-4 h-4 text-ember-400" />
                  <span className="text-zinc-300">
                    {streak} day streak
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-zinc-300">0 projects completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-300">0 badges earned</span>
                </div>
              </div>
            </div>

            {/* Activity */}
            <div className="card p-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Recent Activity
              </h3>
              <div className="text-center py-6">
                <Terminal className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No activity yet</p>
                <p className="text-zinc-600 text-xs mt-1">
                  Start a project to see your progress here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
