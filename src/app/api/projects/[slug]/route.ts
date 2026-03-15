import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StageInfo } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined;

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: {
        stages: {
          orderBy: { number: "asc" },
          include: {
            starterCode: {
              select: { language: true },
            },
          },
        },
        prerequisites: {
          include: {
            prerequisite: {
              select: { id: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found. It may have been removed or the URL is incorrect." },
        { status: 404 }
      );
    }

    let completedStageIds: Set<string> = new Set();
    let userProgress = null;

    if (userId) {
      const completions = await prisma.stageCompletion.findMany({
        where: {
          userId,
          stageId: { in: project.stages.map((s) => s.id) },
        },
        select: { stageId: true },
      });
      completedStageIds = new Set(completions.map((c) => c.stageId));

      userProgress = await prisma.userProgress.findFirst({
        where: { userId, projectId: project.id },
        select: { language: true, startedAt: true, completedAt: true },
      });
    }

    const supportedLanguages = Array.from(
      new Set(
        project.stages.flatMap((s) => s.starterCode.map((sc) => sc.language))
      )
    );

    const stages: StageInfo[] = project.stages.map((stage, index) => {
      const isCompleted = completedStageIds.has(stage.id);
      const previousCompleted =
        index === 0 || completedStageIds.has(project.stages[index - 1].id);
      const isLocked = !userId ? index > 0 : index > 0 && !previousCompleted;

      return {
        id: stage.id,
        number: stage.number,
        title: stage.title,
        narrative: isLocked ? "" : stage.narrative,
        taskDescription: isLocked ? "" : stage.taskDescription,
        hints: isLocked ? [] : (JSON.parse(stage.hints) as StageInfo["hints"]),
        referenceMaterial: isLocked
          ? null
          : (stage.referenceMaterial ? JSON.parse(stage.referenceMaterial) as StageInfo["referenceMaterial"] : null),
        conceptsTaught: JSON.parse(stage.conceptsTaught) as string[],
        isCompleted,
        isLocked,
      };
    });

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        difficulty: project.difficulty,
        estimatedHours: project.estimatedHours,
        icon: project.icon,
        concepts: JSON.parse(project.concepts) as string[],
        supportedLanguages,
        prerequisites: project.prerequisites.map((p) => ({
          id: p.prerequisite.id,
          title: p.prerequisite.title,
          slug: p.prerequisite.slug,
        })),
        stages,
        userProgress,
      },
    });
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return NextResponse.json(
      { error: "Failed to load project details. Please try again later." },
      { status: 500 }
    );
  }
}
