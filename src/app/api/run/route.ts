import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ExecutionResult, TestResult, Language } from "@/types";

const runSchema = z.object({
  projectId: z.string().min(1, "Project ID is required."),
  stageNumber: z.number().int().positive("Stage number must be a positive integer."),
  language: z.enum([
    "python",
    "javascript",
    "go",
    "rust",
    "java",
    "c",
    "typescript",
    "ruby",
  ] as const),
  files: z.record(z.string()).refine(
    (files) => Object.keys(files).length > 0,
    "At least one file must be submitted."
  ),
});

function generateMockTestResults(
  language: Language,
  files: Record<string, string>,
  stageNumber: number
): ExecutionResult {
  const fileNames = Object.keys(files);
  const totalCode = Object.values(files).join("\n");
  const hasMainFile = fileNames.some(
    (f) =>
      f.includes("main") ||
      f.includes("index") ||
      f.includes("app") ||
      f.includes("solution")
  );

  // Simulate execution time based on code size
  const baseTimeMs = 50 + Math.random() * 200;

  const tests: TestResult[] = [];

  // Test 1: Basic compilation / syntax check - usually passes
  tests.push({
    name: "Compilation and syntax check",
    passed: hasMainFile && totalCode.length > 10,
    timeMs: Math.round(baseTimeMs * 0.3),
    ...(hasMainFile && totalCode.length > 10
      ? {}
      : {
          error: !hasMainFile
            ? `No entry point found. Your ${language} solution needs a main file (e.g., main${getExtension(language)}). This file is the starting point that our test runner executes.`
            : "Your file appears to be empty or nearly empty. Make sure you've written your solution before submitting.",
          hint: !hasMainFile
            ? "Look at the starter code for the expected file structure. The entry point filename matters because the test runner looks for it specifically."
            : "Start by reading the task description carefully, then implement the required functionality step by step.",
        }),
  });

  // Test 2: Core functionality - pass based on code content heuristic
  const hasFunctionality = totalCode.length > 50;
  tests.push({
    name: `Stage ${stageNumber} - Core functionality test`,
    passed: hasFunctionality,
    timeMs: Math.round(baseTimeMs * 0.5),
    ...(hasFunctionality
      ? {}
      : {
          error:
            "Your code did not produce the expected output. The test expected a specific behavior that wasn't observed.",
          expected: `[Expected output for stage ${stageNumber}]`,
          actual: "[No output produced]",
          hint: "Break the problem down into smaller pieces. First, make sure your code runs without errors. Then, focus on handling the basic case before edge cases.",
        }),
  });

  // Test 3: Edge case - harder, sometimes fails
  const passesEdgeCase = totalCode.length > 100 && stageNumber <= 2;
  tests.push({
    name: `Stage ${stageNumber} - Edge case handling`,
    passed: passesEdgeCase,
    timeMs: Math.round(baseTimeMs * 0.7),
    ...(passesEdgeCase
      ? {}
      : {
          error:
            "Your solution handles the basic case correctly but fails on an edge case. Consider what happens with empty input, very large values, or special characters.",
          expected: "[Correct edge case output]",
          actual: "[Incorrect or missing edge case output]",
          hint: "Think about boundary conditions: What if the input is empty? What if it contains only one element? What if values are at their maximum? Handling these cases is what separates working code from robust code.",
        }),
  });

  const allPassed = tests.every((t) => t.passed);
  const totalTimeMs = tests.reduce((sum, t) => sum + (t.timeMs ?? 0), 0);

  return {
    status: "completed",
    passed: allPassed,
    tests,
    stdout: allPassed
      ? "All tests passed! Great work."
      : tests.filter((t) => t.passed).length > 0
        ? `${tests.filter((t) => t.passed).length}/${tests.length} tests passed. Keep going - you're making progress!`
        : "No tests passed yet. Review the error messages below for guidance on what to fix first.",
    stderr: allPassed ? "" : "Some tests failed. See individual test results for details.",
    executionTimeMs: Math.round(totalTimeMs),
    memoryUsageMb: Math.round((5 + Math.random() * 20) * 10) / 10,
  };
}

function getExtension(language: Language): string {
  const extensions: Record<Language, string> = {
    python: ".py",
    javascript: ".js",
    go: ".go",
    rust: ".rs",
    java: ".java",
    c: ".c",
    typescript: ".ts",
    ruby: ".rb",
  };
  return extensions[language];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be signed in to run code. Sign in to save your progress and submit solutions." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const body = await request.json();
    const validation = runSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { projectId, stageNumber, language, files } = validation.data;

    // Verify the project and stage exist
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found. The project may have been removed." },
        { status: 404 }
      );
    }

    const stage = await prisma.stage.findUnique({
      where: {
        projectId_number: {
          projectId,
          number: stageNumber,
        },
      },
      select: { id: true },
    });

    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${stageNumber} not found for this project.` },
        { status: 404 }
      );
    }

    // Simulate a brief execution delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    const result = generateMockTestResults(language, files, stageNumber);

    // Record daily activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyActivity.upsert({
      where: {
        userId_date: { userId, date: today },
      },
      update: {
        testsRun: { increment: 1 },
      },
      create: {
        userId,
        date: today,
        testsRun: 1,
      },
    });

    // Save a snapshot of the code
    await prisma.codeSnapshot.create({
      data: {
        userId,
        stageId: stage.id,
        language,
        files: JSON.stringify(files),
        isPassing: result.passed,
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json(
      {
        error: "Something went wrong while running your code. This is on our end - please try again in a moment.",
      },
      { status: 500 }
    );
  }
}
