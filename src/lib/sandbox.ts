import { type Language, LANGUAGE_CONFIG } from "@/types";

export interface SandboxConfig {
  timeoutMs: number;
  memoryLimitMb: number;
  maxFiles: number;
  maxFileSizeKb: number;
}

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  timeoutMs: 10000,
  memoryLimitMb: 256,
  maxFiles: 10,
  maxFileSizeKb: 100,
};

export interface ExecutionJob {
  id: string;
  projectId: string;
  stageNumber: number;
  language: Language;
  files: Record<string, string>;
  testScript: string;
  config: SandboxConfig;
}

export interface ExecutionResult {
  status: "completed" | "error" | "timeout";
  passed: boolean;
  tests: TestResultItem[];
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryUsageMb?: number;
}

export interface TestResultItem {
  name: string;
  passed: boolean;
  timeMs?: number;
  error?: string;
  expected?: string;
  actual?: string;
  hint?: string;
}

/**
 * Validates user-submitted files before execution.
 */
export function validateSubmission(
  files: Record<string, string>,
  config: SandboxConfig = DEFAULT_SANDBOX_CONFIG
): { valid: boolean; error?: string } {
  const fileNames = Object.keys(files);

  if (fileNames.length === 0) {
    return { valid: false, error: "No files submitted" };
  }

  if (fileNames.length > config.maxFiles) {
    return {
      valid: false,
      error: `Too many files. Maximum is ${config.maxFiles}`,
    };
  }

  for (const [name, content] of Object.entries(files)) {
    if (name.includes("..") || name.startsWith("/")) {
      return { valid: false, error: `Invalid filename: ${name}` };
    }

    const sizeKb = Buffer.byteLength(content, "utf8") / 1024;
    if (sizeKb > config.maxFileSizeKb) {
      return {
        valid: false,
        error: `File ${name} exceeds ${config.maxFileSizeKb}KB limit`,
      };
    }
  }

  return { valid: true };
}

/**
 * Returns the Docker image name for a given language.
 */
export function getRuntimeImage(language: Language): string {
  const images: Record<Language, string> = {
    python: "codeforge/runtime-python:3.12",
    javascript: "codeforge/runtime-node:20",
    go: "codeforge/runtime-go:1.22",
    rust: "codeforge/runtime-rust:1.76",
    java: "codeforge/runtime-java:21",
    c: "codeforge/runtime-c:gcc13",
    typescript: "codeforge/runtime-node:20",
    ruby: "codeforge/runtime-ruby:3.3",
  };
  return images[language];
}

/**
 * Returns the run command for a given language.
 */
export function getRunCommand(language: Language): string {
  return LANGUAGE_CONFIG[language].runCommand;
}

/**
 * Parses test output from a shell script into structured test results.
 * Expected format from test scripts:
 *   PASS: Test name
 *   FAIL: Test name
 *   ERROR: Error description
 *   EXPECTED: Expected value
 *   ACTUAL: Actual value
 *   HINT: Hint text
 */
export function parseTestOutput(output: string): TestResultItem[] {
  const lines = output.split("\n");
  const tests: TestResultItem[] = [];
  let currentTest: Partial<TestResultItem> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("PASS: ")) {
      if (currentTest?.name) tests.push(currentTest as TestResultItem);
      currentTest = {
        name: trimmed.slice(6),
        passed: true,
        timeMs: undefined,
      };
    } else if (trimmed.startsWith("FAIL: ")) {
      if (currentTest?.name) tests.push(currentTest as TestResultItem);
      currentTest = {
        name: trimmed.slice(6),
        passed: false,
      };
    } else if (trimmed.startsWith("ERROR: ") && currentTest) {
      currentTest.error = trimmed.slice(7);
    } else if (trimmed.startsWith("EXPECTED: ") && currentTest) {
      currentTest.expected = trimmed.slice(10);
    } else if (trimmed.startsWith("ACTUAL: ") && currentTest) {
      currentTest.actual = trimmed.slice(8);
    } else if (trimmed.startsWith("HINT: ") && currentTest) {
      currentTest.hint = trimmed.slice(6);
    }
  }

  if (currentTest?.name) tests.push(currentTest as TestResultItem);
  return tests;
}

/**
 * Generate Docker run command for sandbox execution.
 * This creates a completely isolated environment.
 */
export function generateDockerCommand(job: ExecutionJob): string {
  const image = getRuntimeImage(job.language);
  const runCmd = getRunCommand(job.language);

  return [
    "docker run",
    "--rm",
    `--memory=${job.config.memoryLimitMb}m`,
    "--memory-swap=-1",
    "--cpus=1",
    "--pids-limit=50",
    "--network=none",
    "--read-only",
    "--tmpfs /tmp:rw,noexec,nosuid,size=50m",
    "-v /workspace:/workspace:ro",
    "-v /tests:/tests:ro",
    `-e RUN_COMMAND="${runCmd}"`,
    `--name codeforge-${job.id}`,
    image,
    `bash /tests/${job.testScript}`,
  ].join(" ");
}

/**
 * Simulate test execution for development/demo purposes.
 * In production, this would be replaced with actual Docker/Firecracker execution.
 */
export async function simulateExecution(
  files: Record<string, string>,
  language: Language,
  stageId: string
): Promise<ExecutionResult> {
  // Simulate execution delay
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));

  const mainFile = Object.values(files)[0] || "";
  const hasSocket =
    mainFile.includes("socket") ||
    mainFile.includes("net.") ||
    mainFile.includes("TcpListener") ||
    mainFile.includes("net.Listen");
  const hasPort =
    mainFile.includes("4221") ||
    mainFile.includes("6379");
  const hasAccept =
    mainFile.includes("accept") ||
    mainFile.includes("createServer") ||
    mainFile.includes("Accept");

  const tests: TestResultItem[] = [];

  if (stageId.includes("bind-port")) {
    tests.push({
      name: "Server binds to a port",
      passed: hasSocket && hasPort,
      timeMs: 45 + Math.floor(Math.random() * 20),
      ...(!hasSocket || !hasPort
        ? {
            error:
              "Could not connect to the expected port. Your server doesn't appear to be listening.",
            expected: "TCP connection accepted",
            actual: "Connection refused",
            hint: "Create a TCP socket, bind it to the correct port, and call listen().",
          }
        : {}),
    });

    tests.push({
      name: "Server accepts TCP connection",
      passed: hasAccept,
      timeMs: 12 + Math.floor(Math.random() * 10),
      ...(!hasAccept
        ? {
            error:
              "Server bound to port but did not accept the connection within 5 seconds.",
            expected: "Connection accepted",
            actual: "Connection timed out",
            hint: "After listen(), you need to call accept() to handle incoming connections.",
          }
        : {}),
    });
  }

  const passed = tests.length > 0 && tests.every((t) => t.passed);
  const totalTime = tests.reduce((sum, t) => sum + (t.timeMs || 0), 0);

  return {
    status: "completed",
    passed,
    tests,
    stdout: hasSocket ? "Server starting...\n" : "",
    stderr: "",
    executionTimeMs: totalTime,
    memoryUsageMb: 12 + Math.floor(Math.random() * 8),
  };
}
