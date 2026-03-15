"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Code2,
  ArrowLeft,
  Check,
  Lock,
  Clock,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGE_CONFIG, DIFFICULTY_CONFIG } from "@/types";
import type { Language, Difficulty } from "@/types";

// Demo project data
const PROJECTS: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    estimatedHours: number;
    concepts: string[];
    supportedLanguages: Language[];
    stages: {
      number: number;
      title: string;
      isCompleted: boolean;
      isLocked: boolean;
    }[];
  }
> = {
  "echo-server": {
    id: "build-echo-server",
    title: "Build Your Own Echo Server",
    description:
      "Build a TCP echo server that accepts connections, reads incoming data, and echoes it back to the client. This project teaches the fundamentals of network programming — how computers communicate over TCP, how to handle multiple connections, and how to build robust concurrent systems.",
    difficulty: "beginner",
    estimatedHours: 6,
    concepts: [
      "TCP server programming",
      "Socket I/O",
      "Connection lifecycle",
      "Concurrent connections",
      "Graceful shutdown",
    ],
    supportedLanguages: ["python", "javascript", "go", "rust"],
    stages: [
      { number: 1, title: "Bind to a Port", isCompleted: false, isLocked: false },
      { number: 2, title: "Accept a Connection", isCompleted: false, isLocked: true },
      { number: 3, title: "Read Data", isCompleted: false, isLocked: true },
      { number: 4, title: "Echo Data Back", isCompleted: false, isLocked: true },
      { number: 5, title: "Handle Multiple Clients", isCompleted: false, isLocked: true },
      { number: 6, title: "Handle Concurrent Clients", isCompleted: false, isLocked: true },
      { number: 7, title: "Graceful Shutdown", isCompleted: false, isLocked: true },
      { number: 8, title: "Stress Test", isCompleted: false, isLocked: true },
    ],
  },
  shell: {
    id: "build-shell",
    title: "Build Your Own Shell",
    description:
      "Build a Unix shell that reads commands, parses arguments, executes programs, and handles pipes and redirections. This project demystifies the terminal and teaches fundamental operating system concepts.",
    difficulty: "beginner",
    estimatedHours: 10,
    concepts: [
      "Process creation (fork/exec)",
      "File descriptors",
      "Pipes and redirection",
      "Signal handling",
      "PATH resolution",
      "Command parsing",
    ],
    supportedLanguages: ["python", "javascript", "go", "rust", "c"],
    stages: [
      { number: 1, title: "Print a Prompt", isCompleted: false, isLocked: false },
      { number: 2, title: "Read Input", isCompleted: false, isLocked: true },
      { number: 3, title: "Parse Command and Arguments", isCompleted: false, isLocked: true },
      { number: 4, title: "Execute External Commands", isCompleted: false, isLocked: true },
      { number: 5, title: "Handle cd", isCompleted: false, isLocked: true },
      { number: 6, title: "Handle exit", isCompleted: false, isLocked: true },
      { number: 7, title: "PATH Resolution", isCompleted: false, isLocked: true },
      { number: 8, title: "Quoting and Escaping", isCompleted: false, isLocked: true },
      { number: 9, title: "Pipes", isCompleted: false, isLocked: true },
      { number: 10, title: "I/O Redirection", isCompleted: false, isLocked: true },
      { number: 11, title: "Background Processes", isCompleted: false, isLocked: true },
      { number: 12, title: "Signal Handling", isCompleted: false, isLocked: true },
    ],
  },
  "http-server": {
    id: "build-http-server",
    title: "Build Your Own HTTP Server",
    description:
      "Build a full HTTP/1.1 server from scratch that can parse requests, route URLs, serve static files, handle compression, and manage persistent connections. Understand the protocol that powers the web.",
    difficulty: "intermediate",
    estimatedHours: 12,
    concepts: [
      "HTTP/1.1 protocol",
      "Request parsing",
      "Content negotiation",
      "Gzip compression",
      "Keep-alive connections",
      "Static file serving",
    ],
    supportedLanguages: ["python", "javascript", "go", "rust", "java"],
    stages: [
      { number: 1, title: "Bind to a Port", isCompleted: false, isLocked: false },
      { number: 2, title: "Parse Request Line", isCompleted: false, isLocked: true },
      { number: 3, title: "Parse Headers", isCompleted: false, isLocked: true },
      { number: 4, title: "Respond with 200 OK", isCompleted: false, isLocked: true },
      { number: 5, title: "Serve Static Files", isCompleted: false, isLocked: true },
      { number: 6, title: "Content-Type Detection", isCompleted: false, isLocked: true },
      { number: 7, title: "Handle 404", isCompleted: false, isLocked: true },
      { number: 8, title: "URL Routing", isCompleted: false, isLocked: true },
      { number: 9, title: "Parse Query Strings", isCompleted: false, isLocked: true },
      { number: 10, title: "Handle POST Body", isCompleted: false, isLocked: true },
      { number: 11, title: "Chunked Transfer Encoding", isCompleted: false, isLocked: true },
      { number: 12, title: "Keep-Alive Connections", isCompleted: false, isLocked: true },
      { number: 13, title: "Gzip Compression", isCompleted: false, isLocked: true },
      { number: 14, title: "Concurrent Connections", isCompleted: false, isLocked: true },
    ],
  },
};

export default function ProjectOverviewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = PROJECTS[slug];
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("python");

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">
            Project Not Found
          </h1>
          <Link href="/dashboard" className="text-forge-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const diffConfig = DIFFICULTY_CONFIG[project.difficulty];
  const completedCount = project.stages.filter((s) => s.isCompleted).length;
  const nextStage =
    project.stages.find((s) => !s.isCompleted && !s.isLocked) ||
    project.stages[0];

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
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded font-medium",
                diffConfig.bgColor,
                diffConfig.color
              )}
            >
              {diffConfig.label}
            </span>
            <span className="text-zinc-500 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />~{project.estimatedHours} hours
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {project.title}
          </h1>
          <p className="text-zinc-400 text-lg max-w-3xl">
            {project.description}
          </p>
        </div>

        {/* What You'll Learn */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-forge-400" />
            What You&apos;ll Learn
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.concepts.map((concept) => (
              <span
                key={concept}
                className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Choose Your Language
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {project.supportedLanguages.map((lang) => {
              const config = LANGUAGE_CONFIG[lang];
              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                    selectedLanguage === lang
                      ? "border-forge-500 bg-forge-500/10"
                      : "border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
                  )}
                >
                  <span className="text-2xl">{config.icon}</span>
                  <span className="text-xs text-zinc-300">{config.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stages */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              Stages ({completedCount}/{project.stages.length})
            </h2>
            <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-forge-500 rounded-full transition-all"
                style={{
                  width: `${(completedCount / project.stages.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            {project.stages.map((stage) => (
              <div
                key={stage.number}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  stage.isCompleted
                    ? "bg-green-500/5"
                    : stage.isLocked
                      ? "opacity-50"
                      : "hover:bg-zinc-800/50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border",
                    stage.isCompleted
                      ? "bg-green-500/20 border-green-500/30 text-green-400"
                      : stage.isLocked
                        ? "bg-zinc-800 border-zinc-700 text-zinc-600"
                        : "bg-forge-500/10 border-forge-500/30 text-forge-400"
                  )}
                >
                  {stage.isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : stage.isLocked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    stage.number
                  )}
                </div>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    stage.isCompleted
                      ? "text-zinc-400 line-through"
                      : stage.isLocked
                        ? "text-zinc-600"
                        : "text-zinc-200"
                  )}
                >
                  Stage {stage.number}: {stage.title}
                </span>
                {!stage.isLocked && !stage.isCompleted && (
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Link
            href={`/workspace/${slug}/${nextStage.number}?lang=${selectedLanguage}`}
            className="btn-primary text-lg px-10 py-3 inline-flex items-center gap-2"
          >
            {completedCount > 0 ? "Continue" : "Start Project"}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
