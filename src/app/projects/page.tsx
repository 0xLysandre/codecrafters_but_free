"use client";

import Link from "next/link";
import {
  Code2,
  ArrowLeft,
  Terminal,
  Globe,
  Database,
  Radio,
  Link2,
  Network,
  Braces,
  GitBranch,
  Container,
  HardDrive,
  Regex,
  Share2,
  MessageSquare,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_CONFIG } from "@/types";
import type { Difficulty } from "@/types";

const ALL_PROJECTS = [
  {
    slug: "echo-server",
    title: "Build Your Own Echo Server",
    description: "TCP echo server with concurrent connections",
    difficulty: "beginner" as Difficulty,
    stages: 8,
    hours: 6,
    icon: Radio,
  },
  {
    slug: "shell",
    title: "Build Your Own Shell",
    description: "Unix shell with pipes, redirection, and signals",
    difficulty: "beginner" as Difficulty,
    stages: 12,
    hours: 10,
    icon: Terminal,
  },
  {
    slug: "url-shortener",
    title: "Build Your Own URL Shortener",
    description: "HTTP API with routing and persistence",
    difficulty: "beginner" as Difficulty,
    stages: 8,
    hours: 5,
    icon: Link2,
  },
  {
    slug: "http-server",
    title: "Build Your Own HTTP Server",
    description: "HTTP/1.1 with routing, compression, and keep-alive",
    difficulty: "intermediate" as Difficulty,
    stages: 14,
    hours: 12,
    icon: Globe,
  },
  {
    slug: "redis",
    title: "Build Your Own Redis",
    description: "In-memory KV store with RESP protocol and persistence",
    difficulty: "intermediate" as Difficulty,
    stages: 16,
    hours: 12,
    icon: Database,
  },
  {
    slug: "dns-resolver",
    title: "Build Your Own DNS Resolver",
    description: "DNS resolver with caching and recursive resolution",
    difficulty: "intermediate" as Difficulty,
    stages: 10,
    hours: 8,
    icon: Network,
  },
  {
    slug: "json-parser",
    title: "Build Your Own JSON Parser",
    description: "Recursive descent parser with error reporting",
    difficulty: "intermediate" as Difficulty,
    stages: 10,
    hours: 8,
    icon: Braces,
  },
  {
    slug: "git",
    title: "Build Your Own Git",
    description: "Version control with SHA-1, objects, and packfiles",
    difficulty: "advanced" as Difficulty,
    stages: 16,
    hours: 16,
    icon: GitBranch,
  },
  {
    slug: "docker",
    title: "Build Your Own Docker",
    description: "Containers with namespaces, cgroups, and images",
    difficulty: "advanced" as Difficulty,
    stages: 12,
    hours: 14,
    icon: Container,
  },
  {
    slug: "sqlite",
    title: "Build Your Own SQLite",
    description: "Database with B-trees, SQL parsing, and indexing",
    difficulty: "advanced" as Difficulty,
    stages: 14,
    hours: 16,
    icon: HardDrive,
  },
  {
    slug: "regex-engine",
    title: "Build Your Own Regex Engine",
    description: "Regex with NFA/DFA, backtracking, and groups",
    difficulty: "expert" as Difficulty,
    stages: 12,
    hours: 14,
    icon: Regex,
  },
  {
    slug: "bittorrent",
    title: "Build Your Own BitTorrent Client",
    description: "P2P file sharing with bencoding and peer protocol",
    difficulty: "expert" as Difficulty,
    stages: 14,
    hours: 16,
    icon: Share2,
  },
  {
    slug: "kafka",
    title: "Build Your Own Kafka",
    description: "Message broker with log storage and consumer groups",
    difficulty: "expert" as Difficulty,
    stages: 12,
    hours: 16,
    icon: MessageSquare,
  },
  {
    slug: "interpreter",
    title: "Build Your Own Interpreter",
    description: "Language interpreter with lexer, parser, and closures",
    difficulty: "expert" as Difficulty,
    stages: 16,
    hours: 18,
    icon: Cpu,
  },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="border-b border-zinc-800/50 bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">All Projects</h1>
        <p className="text-zinc-400 mb-8">
          {ALL_PROJECTS.length} projects across 4 difficulty tiers. Build real
          software from scratch.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PROJECTS.map((project) => {
            const diff = DIFFICULTY_CONFIG[project.difficulty];
            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="card p-5 hover:border-forge-500/30 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      diff.bgColor
                    )}
                  >
                    <project.icon className={cn("w-5 h-5", diff.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          diff.bgColor,
                          diff.color
                        )}
                      >
                        {diff.label}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {project.stages} stages
                      </span>
                      <span className="text-xs text-zinc-600">
                        ~{project.hours}h
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 text-xs">{project.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
