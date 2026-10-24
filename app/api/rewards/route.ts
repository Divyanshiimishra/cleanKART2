import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

class RouteError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const rewards = await prisma.reward.findMany({
      orderBy: { points: "asc" },
    });

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        redemptions: {
          include: { reward: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json({
      rewards,
      userPoints: user?.points || 0,
      redemptions: user?.redemptions || [],
    });
  } catch (error) {
    console.error("Rewards API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const body: unknown = await req.json().catch(() => null);
    const rewardId =
      body && typeof body === "object" && "rewardId" in body
        ? (body as { rewardId?: unknown }).rewardId
        : undefined;

    if (typeof rewardId !== "string" || rewardId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });

      if (!reward) throw new RouteError("Reward not found", 404);
      if (!Number.isSafeInteger(reward.points) || reward.points <= 0) {
        throw new RouteError("Reward is unavailable", 409);
      }

      const debit = await tx.user.updateMany({
        where: {
          email,
          points: { gte: reward.points },
        },
        data: { points: { decrement: reward.points } },
      });

      if (debit.count === 0) {
        const user = await tx.user.findUnique({
          where: { email },
          select: { id: true },
        });

        if (!user) throw new RouteError("User not found", 404);
        throw new RouteError("Insufficient points", 400);
      }

      const user = await tx.user.findUniqueOrThrow({
        where: { email },
        select: { id: true, points: true },
      });

      await tx.redemption.create({
        data: { userId: user.id, rewardId: reward.id },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      remainingPoints: updatedUser.points,
    });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
