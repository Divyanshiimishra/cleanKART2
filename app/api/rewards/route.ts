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

    const rewards = await prisma.reward.findMany({
      orderBy: { points: "asc" },
    });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
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

    const { rewardId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!user || !reward) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (user.points < reward.points) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // Redeem reward
    await prisma.redemption.create({
      data: {
        userId: user.id,
        rewardId: reward.id,
      },
    });

    // Deduct points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: reward.points } },
    });

    return NextResponse.json({
      success: true,
      remainingPoints: updatedUser.points,
    });
  } catch (error) {
    console.error("Redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}