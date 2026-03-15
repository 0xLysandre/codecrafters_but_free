import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LEVEL_XP_REQUIREMENTS, LEVEL_TITLES } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  for (let i = 10; i >= 1; i--) {
    if (xp >= LEVEL_XP_REQUIREMENTS[i]) {
      level = i;
      break;
    }
  }
  return level;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || "Novice";
}

export function getXPProgress(xp: number): {
  currentLevel: number;
  nextLevel: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const nextLevel = Math.min(currentLevel + 1, 10);
  const currentLevelXP = LEVEL_XP_REQUIREMENTS[currentLevel];
  const nextLevelXP = LEVEL_XP_REQUIREMENTS[nextLevel];

  const progress =
    currentLevel === 10
      ? 100
      : ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return { currentLevel, nextLevel, currentLevelXP, nextLevelXP, progress };
}

export function calculateStageXP(
  difficulty: string,
  stageNumber: number
): number {
  const baseXP: Record<string, number> = {
    beginner: 50,
    intermediate: 75,
    advanced: 100,
    expert: 150,
  };
  const base = baseXP[difficulty] || 50;
  return base + stageNumber * 10;
}

export function calculateProjectBonusXP(): number {
  return 500;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
