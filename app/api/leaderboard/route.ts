import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Top 10 users by points
    const topUsers = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        city: true,
        _count: {
          select: { cleanups: true },
        },
      },
    });

    // Current user rank
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        city: true,
        _count: {
          select: { cleanups: true },
        },
      },
    });

    // Count users with more points
    const userRank = currentUser
      ? (await prisma.user.count({
          where: { points: { gt: currentUser.points } },
        })) + 1
      : null;

    return NextResponse.json({
      topUsers: topUsers.map((u: { id: any; name: any; image: any; points: any; city: any; _count: { cleanups: any; }; }, i: number) => ({
        id: u.id,
        name: u.name || "Anonymous",
        image: u.image || "",
        points: u.points,
        city: u.city || "India",
        cleanups: u._count.cleanups,
        rank: i + 1,
      })),
      currentUser: currentUser
        ? {
            id: currentUser.id,
            name: currentUser.name || "Anonymous",
            image: currentUser.image || "",
            points: currentUser.points,
            city: currentUser.city || "India",
            cleanups: currentUser._count.cleanups,
            rank: userRank,
          }
        : null,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}