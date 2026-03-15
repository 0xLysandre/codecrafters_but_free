import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSolutionSchema = z.object({
  language: z.string().min(1, "Language is required."),
  code: z.record(z.string()).refine(
    (files) => Object.keys(files).length > 0,
    "At least one file must be included in the solution."
  ),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters.")
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { stageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown>)?.id as string | undefined;

    // Only allow viewing solutions if the user has completed the stage
    if (userId) {
      const completion = await prisma.stageCompletion.findFirst({
        where: { userId, stageId: params.stageId },
      });

      if (!completion) {
        return NextResponse.json(
          {
            error:
              "Complete this stage before viewing community solutions. This prevents spoilers and encourages you to solve it yourself first.",
          },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Sign in to view community solutions." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const sortBy = searchParams.get("sortBy") ?? "upvotes";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      stageId: params.stageId,
      isFlagged: false,
    };
    if (language) {
      where.language = language;
    }

    const orderBy =
      sortBy === "recent"
        ? { createdAt: "desc" as const }
        : { upvotes: "desc" as const };

    const [solutions, totalCount] = await Promise.all([
      prisma.communitySolution.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
          ...(userId
            ? {
                votes: {
                  where: { userId },
                  select: { vote: true },
                },
              }
            : {}),
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.communitySolution.count({ where }),
    ]);

    const result = solutions.map((sol) => ({
      id: sol.id,
      user: sol.user,
      language: sol.language,
      code: sol.code,
      description: sol.description,
      upvotes: sol.upvotes,
      userVote: (sol as Record<string, unknown>).votes
        ? ((sol as Record<string, unknown>).votes as Array<{ vote: number }>)[0]?.vote ?? 0
        : 0,
      createdAt: sol.createdAt.toISOString(),
    }));

    return NextResponse.json({
      solutions: result,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch solutions:", error);
    return NextResponse.json(
      { error: "Failed to load community solutions. Please try again later." },
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
        { error: "Sign in to share your solution." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Must have completed the stage to share a solution
    const completion = await prisma.stageCompletion.findFirst({
      where: { userId, stageId: params.stageId },
    });

    if (!completion) {
      return NextResponse.json(
        {
          error:
            "Complete this stage before sharing your solution. This ensures all shared solutions actually work.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createSolutionSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { language, code, description } = validation.data;

    // Check for duplicate submissions
    const existing = await prisma.communitySolution.findFirst({
      where: { userId, stageId: params.stageId, language },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You already have a solution for this stage in this language. Each user can share one solution per language per stage.",
        },
        { status: 409 }
      );
    }

    const solution = await prisma.communitySolution.create({
      data: {
        userId,
        stageId: params.stageId,
        language,
        code,
        description,
      },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(
      {
        solution: {
          id: solution.id,
          user: solution.user,
          language: solution.language,
          code: solution.code,
          description: solution.description,
          upvotes: solution.upvotes,
          createdAt: solution.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create solution:", error);
    return NextResponse.json(
      { error: "Failed to share your solution. Please try again." },
      { status: 500 }
    );
  }
}
