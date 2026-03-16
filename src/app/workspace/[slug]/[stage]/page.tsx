"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Code2,
  Play,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  ArrowLeft,
  RotateCcw,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language, StageInfo, Hint, ReferenceMaterial } from "@/types";
import { LANGUAGE_CONFIG } from "@/types";

interface TestResult {
  name: string;
  passed: boolean;
  timeMs?: number;
  error?: string;
  expected?: string;
  actual?: string;
  hint?: string;
}

interface StarterCodeEntry {
  language: string;
  files: Record<string, string>;
  buildCommand: string | null;
}

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const stageNum = parseInt(params.stage as string, 10);
  const lang = (searchParams.get("lang") || "python") as Language;

  const langConfig = LANGUAGE_CONFIG[lang];

  const [stageData, setStageData] = useState<StageInfo | null>(null);
  const [starterCode, setStarterCode] = useState<StarterCodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("// Loading...");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [allPassed, setAllPassed] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [showReference, setShowReference] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "stdout" | "stderr">("results");
  const [leftPanelWidth] = useState(30);
  const [rightPanelWidth] = useState(25);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Fetch stage data from API
  useEffect(() => {
    async function fetchStage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${slug}/stages/${stageNum}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to load stage");
          return;
        }
        const data = await res.json();
        setStageData(data.stage);
        setStarterCode(data.starterCode || []);

        // Set initial code from starter code for selected language
        const langStarter = (data.starterCode as StarterCodeEntry[])?.find(
          (sc) => sc.language === lang
        );
        if (langStarter) {
          const firstFile = Object.values(langStarter.files)[0];
          setCode(firstFile as string);
        } else {
          // No starter code for this language — provide a minimal template
          const ext = LANGUAGE_CONFIG[lang]?.extension || "";
          setCode(`// No starter code available for ${LANGUAGE_CONFIG[lang]?.name || lang}.\n// Write your solution here.\n`);
        }
      } catch {
        setError("Failed to load stage. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchStage();
  }, [slug, stageNum, lang]);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    setStdout("");
    setStderr("");
    setAllPassed(false);
    setActiveTab("results");

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stageNumber: stageNum,
          language: lang,
          files: { [`main${langConfig.extension}`]: code },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTestResults([{
          name: "Execution",
          passed: false,
          error: data.error || "Failed to run tests",
        }]);
        setIsRunning(false);
        return;
      }

      setTestResults(data.tests || []);
      setStdout(data.stdout || "");
      setStderr(data.stderr || "");
      setExecutionTime(data.executionTimeMs || null);
      setAllPassed(data.passed || false);
    } catch {
      setTestResults([{
        name: "Execution",
        passed: false,
        error: "Network error. Please try again.",
      }]);
    }

    setIsRunning(false);
  }, [code, slug, stageNum, lang, langConfig.extension]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runTests();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runTests]);

  const toggleHint = (level: number) => {
    setRevealedHints((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  const resetCode = () => {
    const langStarter = starterCode.find((sc) => sc.language === lang);
    if (langStarter) {
      const firstFile = Object.values(langStarter.files)[0];
      setCode(firstFile as string);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forge-400 animate-spin" />
      </div>
    );
  }

  if (error || !stageData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">
            {error || "Stage Not Found"}
          </h1>
          <Link href="/dashboard" className="text-forge-400 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-[#0d0d14] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/projects/${slug}`}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-forge-400" />
            <span className="text-sm text-zinc-300 font-medium">
              Stage {stageNum}: {stageData.title}
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {langConfig.icon} {langConfig.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetCode}
            className="btn-ghost text-xs flex items-center gap-1"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={runTests}
            disabled={isRunning}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              isRunning
                ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white"
            )}
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? "Running..." : "Run Tests"}
            <span className="text-xs opacity-60 ml-1">⌘↵</span>
          </button>
          {allPassed && (
            <Link
              href={`/workspace/${slug}/${stageNum + 1}?lang=${lang}`}
              className="btn-primary text-sm flex items-center gap-1"
            >
              Next Stage
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel — Challenge Brief */}
        <div
          className="border-r border-zinc-800 overflow-y-auto"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="p-5 space-y-5">
            {/* Stage Info */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">
                Stage {stageNum}: {stageData.title}
              </h2>
              <div className="text-sm text-zinc-400 leading-relaxed whitespace-pre-line">
                {stageData.narrative}
              </div>
            </div>

            {/* Task */}
            <div className="bg-forge-500/5 border border-forge-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-forge-400 mb-2">
                Your Task
              </h3>
              <div className="text-sm text-zinc-300 whitespace-pre-line">
                {stageData.taskDescription}
              </div>
            </div>

            {/* Hints */}
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Hints
              </h3>
              <div className="space-y-2">
                {stageData.hints.map((hint) => (
                  <div key={hint.level} className="rounded-lg border border-zinc-800">
                    <button
                      onClick={() => toggleHint(hint.level)}
                      className="w-full flex items-center justify-between p-3 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <span>
                        Hint {hint.level}{" "}
                        {hint.level === 1
                          ? "(Conceptual)"
                          : hint.level === 2
                            ? "(Specific)"
                            : "(Near-Solution)"}
                      </span>
                      {revealedHints.has(hint.level) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {revealedHints.has(hint.level) && (
                      <div className="px-3 pb-3 text-sm text-zinc-300 whitespace-pre-line border-t border-zinc-800 pt-2">
                        {hint.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reference Material */}
            {stageData.referenceMaterial && (
              <div>
                <button
                  onClick={() => setShowReference(!showReference)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  {stageData.referenceMaterial.title}
                  {showReference ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showReference && (
                  <div className="mt-2 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {stageData.referenceMaterial.body}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center Panel — Code Editor */}
        <div
          className="border-r border-zinc-800 flex flex-col"
          style={{ width: `${100 - leftPanelWidth - rightPanelWidth}%` }}
        >
          {/* Editor Header */}
          <div className="h-9 border-b border-zinc-800 flex items-center px-3 bg-[#0d0d14] shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-zinc-800 text-zinc-300">
                main{langConfig.extension}
              </span>
            </div>
          </div>
          {/* Code Editor Area */}
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="absolute inset-0 w-full h-full bg-[#0a0a0f] text-zinc-200 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
              placeholder="Write your code here..."
            />
          </div>
        </div>

        {/* Right Panel — Test Output */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: `${rightPanelWidth}%` }}
        >
          {/* Tabs */}
          <div className="h-9 border-b border-zinc-800 flex items-center gap-0 bg-[#0d0d14] shrink-0">
            {(["results", "stdout", "stderr"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 h-full text-xs font-medium transition-colors border-b-2 capitalize",
                  activeTab === tab
                    ? "text-zinc-200 border-forge-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                )}
              >
                {tab === "results" ? "Test Results" : tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "results" && (
              <div>
                {testResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Play className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-zinc-500 text-sm">
                      Run tests to see results
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">⌘+Enter</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary */}
                    <div
                      className={cn(
                        "p-3 rounded-lg text-sm font-medium",
                        allPassed
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}
                    >
                      {allPassed
                        ? `All tests passed! Stage ${stageNum} complete.`
                        : `${testResults.filter((t) => t.passed).length}/${testResults.length} tests passed`}
                    </div>

                    {/* Individual Tests */}
                    {testResults.map((test, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-3 rounded-lg border text-sm",
                          test.passed
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-red-500/20 bg-red-500/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {test.passed ? (
                            <Check className="w-4 h-4 text-green-400 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span
                            className={
                              test.passed ? "text-green-300" : "text-red-300"
                            }
                          >
                            {test.name}
                          </span>
                          {test.timeMs && (
                            <span className="text-zinc-600 text-xs ml-auto">
                              {test.timeMs}ms
                            </span>
                          )}
                        </div>
                        {test.error && (
                          <div className="mt-2 space-y-1.5 pl-6">
                            <p className="text-red-300/80 text-xs">
                              {test.error}
                            </p>
                            {test.expected && (
                              <div className="text-xs">
                                <span className="text-zinc-500">Expected: </span>
                                <code className="text-green-400/80">
                                  {test.expected}
                                </code>
                              </div>
                            )}
                            {test.actual && (
                              <div className="text-xs">
                                <span className="text-zinc-500">Actual: </span>
                                <code className="text-red-400/80">
                                  {test.actual}
                                </code>
                              </div>
                            )}
                            {test.hint && (
                              <p className="text-amber-400/80 text-xs mt-1">
                                Hint: {test.hint}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Execution Stats */}
                    {executionTime !== null && (
                      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {executionTime}ms
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "stdout" && (
              <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap">
                {stdout || "No output"}
              </pre>
            )}

            {activeTab === "stderr" && (
              <pre className="text-sm text-red-300/80 font-mono whitespace-pre-wrap">
                {stderr || "No errors"}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
