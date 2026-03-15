import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ProjectSummary } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined;

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const language = searchParams.get("language");

    const where: Record<string, unknown> = { isPublished: true };
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        stages: {
          select: { id: true, number: true },
          orderBy: { number: "asc" },
        },
        prerequisites: {
          select: { prerequisiteId: true },
        },
        ...(userId
          ? {
              progress: {
                where: { userId },
                select: { language: true, completedAt: true },
              },
            }
          : {}),
      },
      orderBy: { displayOrder: "asc" },
    });

    let completedProjectIds: Set<string> = new Set();
    if (userId) {
      const completedProgress = await prisma.userProgress.findMany({
        where: { userId, completedAt: { not: null } },
        select: { projectId: true },
      });
      completedProjectIds = new Set(completedProgress.map((p) => p.projectId));
    }

    let completionCounts: Map<string, number> = new Map();
    if (userId) {
      const completions = await prisma.stageCompletion.findMany({
        where: { userId },
        select: { stageId: true },
      });
      const completedStageIds = new Set(completions.map((c) => c.stageId));

      for (const project of projects) {
        const count = project.stages.filter((s) =>
          completedStageIds.has(s.id)
        ).length;
        completionCounts.set(project.id, count);
      }
    }

    // Filter by supported language if requested
    let filteredProjects = projects;
    if (language) {
      const starterCodeStages = await prisma.starterCode.findMany({
        where: { language },
        select: { stageId: true, stage: { select: { projectId: true } } },
      });
      const projectsWithLanguage = new Set(
        starterCodeStages.map((sc) => sc.stage.projectId)
      );
      filteredProjects = projects.filter((p) => projectsWithLanguage.has(p.id));
    }

    const result: ProjectSummary[] = filteredProjects.map((project) => {
      const prerequisiteIds = project.prerequisites.map((p) => p.prerequisiteId);
      const isLocked =
        prerequisiteIds.length > 0 &&
        !prerequisiteIds.every((id) => completedProjectIds.has(id));

      return {
        id: project.id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        difficulty: project.difficulty as ProjectSummary["difficulty"],
        estimatedHours: project.estimatedHours,
        icon: project.icon,
        concepts: project.concepts,
        stageCount: project.stages.length,
        completedStages: completionCounts.get(project.id) ?? 0,
        supportedLanguages: [],
        isLocked,
      };
    });

    return NextResponse.json({ projects: result });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json(
      { error: "Failed to load projects. Please try again later." },
      { status: 500 }
    );
  }
}
