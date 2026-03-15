import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LEVEL_TITLES } from "@/types";
import type { UserProfile, BadgeInfo, CompletedProject, ActivityDay } from "@/types";

const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores."
    )
    .optional(),
  avatarUrl: z.string().url("Please provide a valid URL for the avatar.").nullable().optional(),
  isProfilePublic: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided to update."
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to view your profile." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        badges: {
          include: {
            badge: true,
          },
          orderBy: { earnedAt: "desc" },
        },
        dailyActivity: {
          orderBy: { date: "desc" },
          take: 365,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const completedProgress = await prisma.userProgress.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        project: {
          select: { id: true, title: true, icon: true },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const badges: BadgeInfo[] = user.badges.map((ub) => ({
      id: ub.badge.id,
      title: ub.badge.title,
      description: ub.badge.description,
      icon: ub.badge.icon,
      earnedAt: ub.earnedAt.toISOString(),
    }));

    const completedProjects: CompletedProject[] = completedProgress.map((up) => ({
      projectId: up.project.id,
      title: up.project.title,
      icon: up.project.icon,
      language: up.language,
      completedAt: up.completedAt!.toISOString(),
    }));

    const activityHeatmap: ActivityDay[] = user.dailyActivity.map((da) => ({
      date: da.date.toISOString().split("T")[0],
      count: da.stagesCompleted + da.testsRun,
    }));

    const profile: UserProfile = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      xp: user.xp,
      level: user.level,
      levelTitle: LEVEL_TITLES[user.level] ?? "Unknown",
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      isProfilePublic: user.isProfilePublic,
      badges,
      completedProjects,
      activityHeatmap,
      joinedAt: user.createdAt.toISOString(),
    };

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to load your profile. Please try again later." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Sign in to update your profile." },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const body = await request.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const updates = validation.data;

    // Check username uniqueness if being changed
    if (updates.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: updates.username,
          id: { not: userId },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "This username is already taken. Please choose a different one." },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        isProfilePublic: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update your profile. Please try again later." },
      { status: 500 }
    );
  }
}
