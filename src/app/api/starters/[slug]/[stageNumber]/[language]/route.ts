import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; stageNumber: string; language: string } }
) {
  try {
    const stageNumber = parseInt(params.stageNumber, 10);
    if (isNaN(stageNumber) || stageNumber < 1) {
      return NextResponse.json(
        { error: "Invalid stage number. Stage numbers start at 1." },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true },
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
      select: { id: true },
    });

    if (!stage) {
      return NextResponse.json(
        { error: `Stage ${stageNumber} not found for project "${project.title}".` },
        { status: 404 }
      );
    }

    const starterCode = await prisma.starterCode.findUnique({
      where: {
        stageId_language: {
          stageId: stage.id,
          language: params.language,
        },
      },
      select: {
        language: true,
        files: true,
        buildCommand: true,
      },
    });

    if (!starterCode) {
      return NextResponse.json(
        {
          error: `No starter code available for ${params.language} in this stage. Check the project page for supported languages.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      starterCode: {
        language: starterCode.language,
        files: JSON.parse(starterCode.files),
        buildCommand: starterCode.buildCommand,
      },
    });
  } catch (error) {
    console.error("Failed to fetch starter code:", error);
    return NextResponse.json(
      { error: "Failed to load starter code. Please try again later." },
      { status: 500 }
    );
  }
}
