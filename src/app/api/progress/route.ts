import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to view your progress." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const userProgress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            slug: true,
            icon: true,
            difficulty: true,
            stages: {
              select: { id: true, number: true },
              orderBy: { number: "asc" },
            },
          },
        },
      },
      orderBy: { startedAt: "desc" },
    });

    const completions = await prisma.stageCompletion.findMany({
      where: { userId },
      select: { stageId: true, language: true, completedAt: true },
    });
    const completedStageIds = new Set(completions.map((c) => c.stageId));

    const progress = userProgress.map((up) => {
      const totalStages = up.project.stages.length;
      const completedStages = up.project.stages.filter((s) =>
        completedStageIds.has(s.id)
      ).length;

      return {
        projectId: up.project.id,
        title: up.project.title,
        slug: up.project.slug,
        icon: up.project.icon,
        difficulty: up.project.difficulty,
        language: up.language,
        totalStages,
        completedStages,
        percentComplete: totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0,
        startedAt: up.startedAt.toISOString(),
        completedAt: up.completedAt?.toISOString() ?? null,
        currentStage: completedStages + 1,
      };
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return NextResponse.json(
      { error: "Failed to load your progress. Please try again later." },
      { status: 500 }
    );
  }
}
