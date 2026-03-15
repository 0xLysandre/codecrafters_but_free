import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSnapshotSchema = z.object({
  language: z.string().min(1, "Language is required."),
  files: z.record(z.string()).refine(
    (files) => Object.keys(files).length > 0,
    "At least one file must be included in the snapshot."
  ),
  isPassing: z.boolean().default(false),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to view your code snapshots." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");

    const where: Record<string, unknown> = {
      userId,
      stageId: params.stageId,
    };
    if (language) {
      where.language = language;
    }

    const snapshots = await prisma.codeSnapshot.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        language: true,
        files: true,
        isPassing: true,
        createdAt: true,
      },
    });

    const parsed = snapshots.map((s) => ({
      ...s,
      files: JSON.parse(s.files),
    }));

    return NextResponse.json({ snapshots: parsed });
  } catch (error) {
    console.error("Failed to fetch snapshots:", error);
    return NextResponse.json(
      { error: "Failed to load your code snapshots. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to save code snapshots." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Verify the stage exists
    const stage = await prisma.stage.findUnique({
      where: { id: params.stageId },
      select: { id: true },
    });

    if (!stage) {
      return NextResponse.json(
        { error: "Stage not found." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = createSnapshotSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { language, files, isPassing } = validation.data;

    const snapshot = await prisma.codeSnapshot.create({
      data: {
        userId,
        stageId: params.stageId,
        language,
        files: JSON.stringify(files),
        isPassing,
      },
      select: {
        id: true,
        language: true,
        files: true,
        isPassing: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ snapshot: { ...snapshot, files: JSON.parse(snapshot.files) } }, { status: 201 });
  } catch (error) {
    console.error("Failed to save snapshot:", error);
    return NextResponse.json(
      { error: "Failed to save your code snapshot. Please try again." },
      { status: 500 }
    );
  }
}
