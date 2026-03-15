import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEVEL_XP_REQUIREMENTS } from "@/types";

const completeSchema = z.object({
  language: z.string().min(1, "Language is required."),
  hintsUsed: z.number().int().min(0).default(0),
  attempts: z.number().int().min(1).default(1),
  finalCode: z.record(z.string()).optional(),
  executionTimeMs: z.number().int().optional(),
});

function calculateXp(
  stageNumber: number,
  hintsUsed: number,
  attempts: number
): number {
  const baseXp = 100;
  const stageBonus = stageNumber * 25;
  const hintPenalty = Math.min(hintsUsed * 15, baseXp * 0.5);
  const attemptPenalty = Math.min((attempts - 1) * 5, baseXp * 0.3);
  return Math.max(Math.round(baseXp + stageBonus - hintPenalty - attemptPenalty), 25);
}

function calculateLevel(totalXp: number): number {
  let level = 1;
  for (const [lvl, xpReq] of Object.entries(LEVEL_XP_REQUIREMENTS)) {
    if (totalXp >= xpReq) {
      level = parseInt(lvl, 10);
    }
  }
  return level;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; stageNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to save your progress." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const stageNumber = parseInt(params.stageNumber, 10);

    if (isNaN(stageNumber) || stageNumber < 1) {
      return NextResponse.json(
        { error: "Invalid stage number." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = completeSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { language, hintsUsed, attempts, finalCode, executionTimeMs } =
      validation.data;

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: {
        stages: {
          orderBy: { number: "asc" },
          select: { id: true, number: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 }
      );
    }

    const stage = project.stages.find((s) => s.number === stageNumber);
    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${stageNumber} not found for this project.` },
        { status: 404 }
      );
    }

    // Check if already completed
    const existingCompletion = await prisma.stageCompletion.findUnique({
      where: {
        userId_stageId_language: {
          userId,
          stageId: stage.id,
          language,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { message: "You have already completed this stage.", xpAwarded: 0, alreadyCompleted: true },
        { status: 200 }
      );
    }

    // Verify previous stage is completed (if not stage 1)
    if (stageNumber > 1) {
      const previousStage = project.stages.find((s) => s.number === stageNumber - 1);
      if (previousStage) {
        const prevCompletion = await prisma.stageCompletion.findFirst({
          where: { userId, stageId: previousStage.id },
        });
        if (!prevCompletion) {
          return NextResponse.json(
            { error: `You must complete stage ${stageNumber - 1} first.` },
            { status: 403 }
          );
        }
      }
    }

    const xpAwarded = calculateXp(stageNumber, hintsUsed, attempts);

    // Use a transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create stage completion
      const completion = await tx.stageCompletion.create({
        data: {
          userId,
          stageId: stage.id,
          language,
          hintsUsed,
          attempts,
          finalCode: finalCode ?? undefined,
          executionTimeMs,
        },
      });

      // Ensure user progress exists
      await tx.userProgress.upsert({
        where: {
          userId_projectId_language: {
            userId,
            projectId: project.id,
            language,
          },
        },
        update: {},
        create: {
          userId,
          projectId: project.id,
          language,
        },
      });

      // Award XP and update level
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpAwarded },
        },
        select: { xp: true },
      });

      const newLevel = calculateLevel(updatedUser.xp);
      await tx.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });

      // Update streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { streakLastActiveDate: true, currentStreak: true, longestStreak: true },
      });

      if (user) {
        const lastActive = user.streakLastActiveDate;
        let newStreak = user.currentStreak;

        if (!lastActive) {
          newStreak = 1;
        } else {
          const diffDays = Math.floor(
            (today.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays === 1) {
            newStreak = user.currentStreak + 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
          // diffDays === 0 means same day, no change
        }

        await tx.user.update({
          where: { id: userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, user.longestStreak),
            streakLastActiveDate: today,
          },
        });
      }

      // Update daily activity
      await tx.dailyActivity.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        update: {
          stagesCompleted: { increment: 1 },
          xpEarned: { increment: xpAwarded },
        },
        create: {
          userId,
          date: today,
          stagesCompleted: 1,
          xpEarned: xpAwarded,
        },
      });

      // Check if all stages in project are complete
      const allStageIds = project.stages.map((s) => s.id);
      const completedCount = await tx.stageCompletion.count({
        where: {
          userId,
          stageId: { in: allStageIds },
        },
      });

      let projectCompleted = false;
      if (completedCount >= allStageIds.length) {
        projectCompleted = true;
        await tx.userProgress.update({
          where: {
            userId_projectId_language: {
              userId,
              projectId: project.id,
              language,
            },
          },
          data: { completedAt: new Date() },
        });
      }

      return {
        completion,
        xpAwarded,
        totalXp: updatedUser.xp,
        newLevel,
        projectCompleted,
      };
    });

    return NextResponse.json({
      message: result.projectCompleted
        ? "Congratulations! You completed the entire project!"
        : "Stage completed! Great work.",
      xpAwarded: result.xpAwarded,
      totalXp: result.totalXp,
      level: result.newLevel,
      projectCompleted: result.projectCompleted,
      completionId: result.completion.id,
    });
  } catch (error) {
    console.error("Failed to complete stage:", error);
    return NextResponse.json(
      { error: "Failed to save your completion. Please try again." },
      { status: 500 }
    );
  }
}
