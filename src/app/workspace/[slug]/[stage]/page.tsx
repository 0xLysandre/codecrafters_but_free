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
  MemoryStick,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Language } from "@/types";
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

// Demo stage data
const STAGE_DATA: Record<string, Record<number, {
  title: string;
  narrative: string;
  task: string;
  hints: { level: number; text: string }[];
  reference: { title: string; body: string } | null;
  starterCode: Record<string, string>;
}>> = {
  "echo-server": {
    1: {
      title: "Bind to a Port",
      narrative:
        "Every network server starts the same way: by claiming a port number and listening for connections. When your server binds to port 4221, it tells the operating system \"I want to receive any TCP traffic directed at this port.\"\n\nThis is the foundation of all networked software. Web servers bind to port 80 or 443. Redis binds to 6379. Your echo server will bind to 4221.\n\nIn this stage, you'll create the simplest possible TCP server — one that just binds to a port and accepts a single connection.",
      task: "Create a TCP server that:\n- Binds to port 4221 on localhost\n- Listens for incoming connections\n- Accepts at least one TCP connection\n- Closes the connection gracefully",
      hints: [
        {
          level: 1,
          text: "Look up how to create a TCP/socket server in your language. The key operations are: create socket, bind, listen, accept.",
        },
        {
          level: 2,
          text: "In Python, use the `socket` module. Create a socket with `socket.socket(socket.AF_INET, socket.SOCK_STREAM)`, then call `bind(('localhost', 4221))`, `listen()`, and `accept()`.",
        },
        {
          level: 3,
          text: "Here's the structure:\n```\n1. Create a TCP socket (AF_INET, SOCK_STREAM)\n2. Set SO_REUSEADDR option (prevents 'address already in use')\n3. Bind to ('localhost', 4221)\n4. Call listen()\n5. Call accept() to wait for a connection\n6. Close the connection and socket\n```",
        },
      ],
      reference: {
        title: "TCP Sockets 101",
        body: "TCP (Transmission Control Protocol) provides reliable, ordered communication between two programs over a network. A server 'binds' to a port number and 'listens' for incoming connections. When a client connects, the server 'accepts' the connection, creating a dedicated two-way communication channel.\n\nThe typical server lifecycle:\n1. **socket()** — Create an endpoint for communication\n2. **bind()** — Associate the socket with a specific port\n3. **listen()** — Mark the socket as passive (ready to accept)\n4. **accept()** — Wait for and accept a connection\n5. **read/write** — Exchange data with the client\n6. **close()** — Tear down the connection",
      },
      starterCode: {
        python:
          'import socket\n\n\ndef main():\n    # TODO: Create a TCP server that binds to port 4221\n    # and accepts at least one incoming connection.\n    #\n    # Steps:\n    # 1. Create a TCP socket\n    # 2. Bind it to ("localhost", 4221)\n    # 3. Start listening for connections\n    # 4. Accept a connection\n    # 5. Close the connection\n    print("Server starting...")\n\n\nif __name__ == "__main__":\n    main()\n',
        javascript:
          'const net = require("net");\n\nfunction main() {\n  // TODO: Create a TCP server that binds to port 4221\n  // and accepts at least one incoming connection.\n  //\n  // Steps:\n  // 1. Create a TCP server using net.createServer()\n  // 2. Listen on port 4221\n  // 3. Handle the "connection" event\n  // 4. Close the connection when done\n  console.log("Server starting...");\n}\n\nmain();\n',
        go: 'package main\n\nimport (\n\t"fmt"\n)\n\nfunc main() {\n\t// TODO: Create a TCP server that binds to port 4221\n\t// and accepts at least one incoming connection.\n\t//\n\t// Steps:\n\t// 1. Use net.Listen("tcp", "localhost:4221")\n\t// 2. Accept a connection with listener.Accept()\n\t// 3. Close the connection\n\tfmt.Println("Server starting...")\n}\n',
        rust: 'use std::net::TcpListener;\n\nfn main() {\n    // TODO: Create a TCP server that binds to port 4221\n    // and accepts at least one incoming connection.\n    //\n    // Steps:\n    // 1. Use TcpListener::bind("localhost:4221")\n    // 2. Accept a connection with listener.accept()\n    // 3. The connection is automatically closed when dropped\n    println!("Server starting...");\n}\n',
      },
    },
    2: {
      title: "Accept a Connection",
      narrative:
        "Now that your server can bind to a port, it's time to actually do something when a client connects. In this stage, you'll accept the connection and keep the server running so it can handle more connections in the future.\n\nA real echo server needs to stay alive — it doesn't quit after one connection. You'll modify your server to accept connections in a loop.",
      task: "Modify your server to:\n- Accept connections in a loop (don't exit after one connection)\n- Print a message when a client connects\n- Close each connection after accepting it\n- Keep the server running until manually stopped",
      hints: [
        {
          level: 1,
          text: "Wrap your accept() call in an infinite loop. After accepting a connection, close it and loop back to accept the next one.",
        },
        {
          level: 2,
          text: "In Python: `while True: conn, addr = server.accept(); print(f'Connected: {addr}'); conn.close()`",
        },
        {
          level: 3,
          text: "Make sure you:\n1. Use a `while True` loop around `accept()`\n2. Close each connection after accepting\n3. Don't close the server socket inside the loop",
        },
      ],
      reference: null,
      starterCode: {
        python:
          'import socket\n\n\ndef main():\n    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)\n    server.bind(("localhost", 4221))\n    server.listen()\n    print("Server listening on port 4221...")\n\n    # TODO: Accept connections in a loop\n    # For each connection:\n    #   1. Print that a client connected\n    #   2. Close the connection\n    #   3. Continue accepting more connections\n    conn, addr = server.accept()\n    conn.close()\n    server.close()\n\n\nif __name__ == "__main__":\n    main()\n',
        javascript:
          'const net = require("net");\n\nfunction main() {\n  // TODO: Accept connections and keep the server running.\n  // The server should not exit after one connection.\n  const server = net.createServer((connection) => {\n    console.log("Client connected");\n    // TODO: Handle the connection\n    connection.end();\n  });\n\n  server.listen(4221, "localhost", () => {\n    console.log("Server listening on port 4221...");\n  });\n}\n\nmain();\n',
      },
    },
  },
};

export default function WorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const stageNum = parseInt(params.stage as string, 10);
  const lang = (searchParams.get("lang") || "python") as Language;

  const stageData = STAGE_DATA[slug]?.[stageNum];
  const langConfig = LANGUAGE_CONFIG[lang];

  const [code, setCode] = useState(stageData?.starterCode[lang] || "// Loading...");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [allPassed, setAllPassed] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [showReference, setShowReference] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "stdout" | "stderr">("results");
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const [rightPanelWidth, setRightPanelWidth] = useState(25);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    setTestResults([]);
    setStdout("");
    setStderr("");
    setAllPassed(false);
    setActiveTab("results");

    // Simulate test execution
    await new Promise((r) => setTimeout(r, 500));

    const mockResults: TestResult[] = [
      {
        name: `Server binds to port 4221`,
        passed: code.includes("4221"),
        timeMs: 45,
        ...(code.includes("4221")
          ? {}
          : {
              error:
                "Could not connect to localhost:4221. Your server doesn't appear to be listening.",
              expected: "TCP connection accepted on port 4221",
              actual: "Connection refused (errno 111)",
              hint: "Make sure your server binds to port 4221 and calls listen() before accept().",
            }),
      },
      {
        name: `Server accepts TCP connection`,
        passed: code.includes("accept") || code.includes("createServer"),
        timeMs: 12,
        ...(code.includes("accept") || code.includes("createServer")
          ? {}
          : {
              error:
                "Server bound to port but did not accept the connection within 5 seconds.",
              expected: "Connection accepted",
              actual: "Connection timed out",
              hint: "After listen(), you need to call accept() to actually accept incoming connections.",
            }),
      },
    ];

    if (stageNum >= 2) {
      mockResults.push({
        name: `Server stays alive after first connection`,
        passed: code.includes("while") || code.includes("loop") || code.includes("createServer"),
        timeMs: 200,
      });
    }

    const passed = mockResults.every((r) => r.passed);

    setTestResults(mockResults);
    setStdout("Server starting...\nListening on port 4221...");
    setExecutionTime(mockResults.reduce((sum, r) => sum + (r.timeMs || 0), 0));
    setAllPassed(passed);
    setIsRunning(false);
  }, [code, stageNum]);

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
    if (stageData?.starterCode[lang]) {
      setCode(stageData.starterCode[lang]);
    }
  };

  if (!stageData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-2">Stage Not Found</h1>
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
                {stageData.task}
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
            {stageData.reference && (
              <div>
                <button
                  onClick={() => setShowReference(!showReference)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  {stageData.reference.title}
                  {showReference ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showReference && (
                  <div className="mt-2 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {stageData.reference.body}
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
