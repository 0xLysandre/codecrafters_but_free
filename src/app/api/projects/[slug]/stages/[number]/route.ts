import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { StageInfo } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; number: string } }
) {
  try {
    const stageNumber = parseInt(params.number, 10);
    if (isNaN(stageNumber) || stageNumber < 1) {
      return NextResponse.json(
        { error: "Invalid stage number. Stage numbers start at 1." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined;

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found. It may have been removed or the URL is incorrect." },
        { status: 404 }
      );
    }

    const stage = await prisma.stage.findUnique({
      where: {
        projectId_number: {
          projectId: project.id,
          number: stageNumber,
        },
      },
      include: {
        starterCode: {
          select: { language: true, files: true, buildCommand: true },
        },
      },
    });

    if (!stage) {
      return NextResponse.json(
        {
          error: `Stage ${stageNumber} does not exist for this project. Check the project page for available stages.`,
        },
        { status: 404 }
      );
    }

    // Check if user has access (previous stage completed or it's stage 1)
    if (stageNumber > 1 && userId) {
      const previousStage = await prisma.stage.findUnique({
        where: {
          projectId_number: {
            projectId: project.id,
            number: stageNumber - 1,
          },
        },
        select: { id: true },
      });

      if (previousStage) {
        const previousCompletion = await prisma.stageCompletion.findFirst({
          where: { userId, stageId: previousStage.id },
        });

        if (!previousCompletion) {
          return NextResponse.json(
            {
              error: `You need to complete stage ${stageNumber - 1} before accessing this stage. Each stage builds on the previous one.`,
            },
            { status: 403 }
          );
        }
      }
    } else if (stageNumber > 1 && !userId) {
      return NextResponse.json(
        { error: "Sign in to access stages beyond the first one." },
        { status: 401 }
      );
    }

    let isCompleted = false;
    if (userId) {
      const completion = await prisma.stageCompletion.findFirst({
        where: { userId, stageId: stage.id },
      });
      isCompleted = !!completion;
    }

    const stageInfo: StageInfo = {
      id: stage.id,
      number: stage.number,
      title: stage.title,
      narrative: stage.narrative,
      taskDescription: stage.taskDescription,
      hints: JSON.parse(stage.hints) as StageInfo["hints"],
      referenceMaterial: stage.referenceMaterial ? JSON.parse(stage.referenceMaterial) as StageInfo["referenceMaterial"] : null,
      conceptsTaught: JSON.parse(stage.conceptsTaught) as string[],
      isCompleted,
      isLocked: false,
    };

    return NextResponse.json({
      stage: stageInfo,
      starterCode: stage.starterCode.map((sc) => ({
        language: sc.language,
        files: JSON.parse(sc.files),
        buildCommand: sc.buildCommand,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch stage:", error);
    return NextResponse.json(
      { error: "Failed to load stage content. Please try again later." },
      { status: 500 }
    );
  }
}
