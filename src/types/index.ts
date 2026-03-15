export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type Language =
  | "python"
  | "javascript"
  | "go"
  | "rust"
  | "java"
  | "c"
  | "typescript"
  | "ruby";

export interface ProjectSummary {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  estimatedHours: number;
  icon: string;
  concepts: string[];
  stageCount: number;
  completedStages: number;
  supportedLanguages: Language[];
  isLocked: boolean;
}

export interface StageInfo {
  id: string;
  number: number;
  title: string;
  narrative: string;
  taskDescription: string;
  hints: Hint[];
  referenceMaterial: ReferenceMaterial | null;
  conceptsTaught: string[];
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Hint {
  level: number;
  text: string;
}

export interface ReferenceMaterial {
  title: string;
  body: string;
  diagram?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  timeMs?: number;
  error?: string;
  expected?: string;
  actual?: string;
  hint?: string;
}

export interface ExecutionResult {
  status: "completed" | "error" | "timeout";
  passed: boolean;
  tests: TestResult[];
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  memoryUsageMb?: number;
}

export interface WebSocketMessage {
  type:
    | "status"
    | "test_start"
    | "test_pass"
    | "test_fail"
    | "stdout"
    | "stderr"
    | "done"
    | "error"
    | "timeout";
  data: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  levelTitle: string;
  currentStreak: number;
  longestStreak: number;
  isProfilePublic: boolean;
  badges: BadgeInfo[];
  completedProjects: CompletedProject[];
  activityHeatmap: ActivityDay[];
  joinedAt: string;
}

export interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface CompletedProject {
  projectId: string;
  title: string;
  icon: string;
  language: string;
  completedAt: string;
}

export interface ActivityDay {
  date: string;
  count: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  xp: number;
  level: number;
  projectsCompleted: number;
  currentStreak: number;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: "Novice",
  2: "Apprentice",
  3: "Journeyman",
  4: "Craftsman",
  5: "Artisan",
  6: "Engineer",
  7: "Architect",
  8: "Master Builder",
  9: "Grand Architect",
  10: "Legend",
};

export const LEVEL_XP_REQUIREMENTS: Record<number, number> = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3500,
  5: 7000,
  6: 12000,
  7: 20000,
  8: 35000,
  9: 55000,
  10: 80000,
};

export const LANGUAGE_CONFIG: Record<
  Language,
  { name: string; icon: string; extension: string; runCommand: string }
> = {
  python: {
    name: "Python",
    icon: "🐍",
    extension: ".py",
    runCommand: "python3 main.py",
  },
  javascript: {
    name: "JavaScript",
    icon: "🟨",
    extension: ".js",
    runCommand: "node main.js",
  },
  go: {
    name: "Go",
    icon: "🔵",
    extension: ".go",
    runCommand: "go run main.go",
  },
  rust: {
    name: "Rust",
    icon: "🦀",
    extension: ".rs",
    runCommand: "cargo run --quiet",
  },
  java: {
    name: "Java",
    icon: "☕",
    extension: ".java",
    runCommand: "javac Main.java && java Main",
  },
  c: {
    name: "C",
    icon: "⚙️",
    extension: ".c",
    runCommand: "gcc -o app main.c && ./app",
  },
  typescript: {
    name: "TypeScript",
    icon: "🔷",
    extension: ".ts",
    runCommand: "npx tsx main.ts",
  },
  ruby: {
    name: "Ruby",
    icon: "💎",
    extension: ".rb",
    runCommand: "ruby main.rb",
  },
};

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; bgColor: string }
> = {
  beginner: {
    label: "Beginner",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  advanced: {
    label: "Advanced",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  expert: {
    label: "Expert",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
};
