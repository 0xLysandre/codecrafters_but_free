import { prisma } from "./db";
import { getLevelFromXP, calculateStageXP, calculateProjectBonusXP } from "./utils";

/**
 * Award XP to a user for completing a stage.
 * Updates user XP, level, streak, and checks for badge eligibility.
 */
export async function awardStageCompletion(
  userId: string,
  stageId: string,
  projectId: string,
  projectDifficulty: string,
  stageNumber: number,
  language: string,
  code: Record<string, string>,
  executionTimeMs: number,
  hintsUsed: number,
  attempts: number
): Promise<{
  xpAwarded: number;
  newLevel: number;
  badgesEarned: string[];
  projectCompleted: boolean;
}> {
  // Check if already completed
  const existing = await prisma.stageCompletion.findUnique({
    where: {
      userId_stageId_language: { userId, stageId, language },
    },
  });

  if (existing) {
    return { xpAwarded: 0, newLevel: 0, badgesEarned: [], projectCompleted: false };
  }

  // Calculate XP
  const stageXP = calculateStageXP(projectDifficulty, stageNumber);

  // Record completion
  await prisma.stageCompletion.create({
    data: {
      userId,
      stageId,
      language,
      hintsUsed,
      attempts,
      finalCode: code,
      executionTimeMs,
    },
  });

  // Update user XP
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: stageXP },
    },
  });

  const newLevel = getLevelFromXP(user.xp);
  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  // Update streak
  await updateStreak(userId);

  // Update daily activity
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyActivity.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    update: {
      stagesCompleted: { increment: 1 },
      xpEarned: { increment: stageXP },
    },
    create: {
      userId,
      date: today,
      stagesCompleted: 1,
      testsRun: 1,
      xpEarned: stageXP,
    },
  });

  // Check if project is completed
  let totalXP = stageXP;
  let projectCompleted = false;
  const allStages = await prisma.stage.findMany({
    where: { projectId },
  });
  const completedStages = await prisma.stageCompletion.findMany({
    where: { userId, language, stageId: { in: allStages.map((s) => s.id) } },
  });

  if (completedStages.length === allStages.length) {
    projectCompleted = true;
    const bonusXP = calculateProjectBonusXP();
    totalXP += bonusXP;

    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: bonusXP } },
    });

    await prisma.userProgress.update({
      where: {
        userId_projectId_language: { userId, projectId, language },
      },
      data: { completedAt: new Date() },
    });
  }

  // Check badges
  const badgesEarned = await checkBadges(userId, projectId, language);

  return {
    xpAwarded: totalXP,
    newLevel: getLevelFromXP(user.xp + totalXP - stageXP),
    badgesEarned,
    projectCompleted,
  };
}

/**
 * Update user's streak based on activity.
 */
async function updateStreak(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.streakLastActiveDate;
  if (!lastActive) {
    // First activity
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,
        longestStreak: Math.max(user.longestStreak, 1),
        streakLastActiveDate: today,
      },
    });
    return;
  }

  const lastDate = new Date(lastActive);
  lastDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    // Same day, no streak change
    return;
  }

  if (diffDays === 1) {
    // Consecutive day
    const newStreak = user.currentStreak + 1;
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        streakLastActiveDate: today,
      },
    });
  } else if (diffDays === 2) {
    // Check weekend grace or streak freeze
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayOfWeek = yesterday.getDay();

    // Weekend grace: if the missed day was Saturday or Sunday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const newStreak = user.currentStreak + 1;
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          streakLastActiveDate: today,
        },
      });
    } else if (user.streakFreezesRemaining > 0) {
      // Use streak freeze
      const newStreak = user.currentStreak + 1;
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(user.longestStreak, newStreak),
          streakLastActiveDate: today,
          streakFreezesRemaining: { decrement: 1 },
        },
      });
    } else {
      // Streak broken
      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: 1,
          streakLastActiveDate: today,
        },
      });
    }
  } else {
    // Streak broken (missed more than 1 day)
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak: 1,
        streakLastActiveDate: today,
      },
    });
  }
}

/**
 * Check and award badges for a user.
 */
async function checkBadges(
  userId: string,
  projectId: string,
  language: string
): Promise<string[]> {
  const earnedBadges: string[] = [];

  // Check project completion badge
  const badges = await prisma.badge.findMany({
    where: { criteriaType: "project_complete" },
  });

  for (const badge of badges) {
    const config = badge.criteriaConfig as { projectId: string };
    if (config.projectId !== projectId) continue;

    const progress = await prisma.userProgress.findFirst({
      where: {
        userId,
        projectId: config.projectId,
        completedAt: { not: null },
      },
    });

    if (progress) {
      const existing = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (!existing) {
        await prisma.userBadge.create({
          data: { userId, badgeId: badge.id },
        });
        earnedBadges.push(badge.id);
      }
    }
  }

  // Check meta badges
  const metaBadges = await prisma.badge.findMany({
    where: { criteriaType: "meta" },
  });

  for (const badge of metaBadges) {
    const config = badge.criteriaConfig as Record<string, unknown>;

    if (config.type === "multi_language") {
      // Check if any project completed in 3+ languages
      const completions = await prisma.userProgress.findMany({
        where: { userId, completedAt: { not: null } },
      });
      const projectLangs = new Map<string, Set<string>>();
      for (const c of completions) {
        if (!projectLangs.has(c.projectId)) {
          projectLangs.set(c.projectId, new Set());
        }
        projectLangs.get(c.projectId)!.add(c.language);
      }
      const qualifies = Array.from(projectLangs.values()).some(
        (langs) => langs.size >= (config.count as number)
      );
      if (qualifies) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          earnedBadges.push(badge.id);
        }
      }
    }

    if (config.type === "streak") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.currentStreak >= (config.days as number)) {
        const existing = await prisma.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } },
        });
        if (!existing) {
          await prisma.userBadge.create({
            data: { userId, badgeId: badge.id },
          });
          earnedBadges.push(badge.id);
        }
      }
    }
  }

  return earnedBadges;
}

/**
 * Reset streak freezes monthly (call from a cron job).
 */
export async function resetMonthlyStreakFreezes(): Promise<void> {
  await prisma.user.updateMany({
    data: { streakFreezesRemaining: 2 },
  });
}
