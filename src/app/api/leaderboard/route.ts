import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import type { LeaderboardEntry } from "@/types";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortBy: z.enum(["xp", "streak", "projects"]).default("xp"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = querySchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 25,
      sortBy: searchParams.get("sortBy") ?? "xp",
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters." },
        { status: 400 }
      );
    }

    const { page, limit, sortBy } = validation.data;
    const skip = (page - 1) * limit;

    let orderBy: Record<string, string>;
    switch (sortBy) {
      case "streak":
        orderBy = { currentStreak: "desc" };
        break;
      case "projects":
        // We'll sort in memory for project count
        orderBy = { xp: "desc" };
        break;
      default:
        orderBy = { xp: "desc" };
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: { isProfilePublic: true },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          xp: true,
          level: true,
          currentStreak: true,
          _count: {
            select: {
              progress: {
                where: { completedAt: { not: null } },
              },
            },
          },
        },
        orderBy,
        skip: sortBy === "projects" ? 0 : skip,
        take: sortBy === "projects" ? undefined : limit,
      }),
      prisma.user.count({ where: { isProfilePublic: true } }),
    ]);

    let rankedUsers = users.map((user) => ({
      ...user,
      projectsCompleted: user._count.progress,
    }));

    // If sorting by projects, sort and paginate in memory
    if (sortBy === "projects") {
      rankedUsers.sort((a, b) => b.projectsCompleted - a.projectsCompleted);
      rankedUsers = rankedUsers.slice(skip, skip + limit);
    }

    const entries: LeaderboardEntry[] = rankedUsers.map((user, index) => ({
      rank: skip + index + 1,
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      projectsCompleted: user.projectsCompleted,
      currentStreak: user.currentStreak,
    }));

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to load the leaderboard. Please try again later." },
      { status: 500 }
    );
  }
}
