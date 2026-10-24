import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

class RouteError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function parseDonation(value: unknown): number | null {
  const points =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;

  return Number.isSafeInteger(points) && points > 0 ? points : null;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { drives: true },
    });

    const communities = await prisma.community.findMany({
      where: { status: "APPROVED" },
      orderBy: { members: "desc" },
      include: { _count: { select: { drives: true } } },
    });
    const joinedIds = new Set(user?.drives.map((drive) => drive.communityId) ?? []);

    return NextResponse.json({
      communities: communities.map((community) => ({
        id: community.id,
        name: community.name,
        description: community.description,
        organizer: community.organizer,
        location: community.location,
        date: community.date,
        members: community.members + community._count.drives,
        isJoined: joinedIds.has(community.id),
      })),
      userPoints: user?.points ?? 0,
    });
  } catch (error) {
    console.error("Community API error:", error);
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
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { communityId, action, donatePoints } = body as Record<string, unknown>;
    if (
      typeof communityId !== "string" ||
      communityId.trim() === "" ||
      (action !== "join" && action !== "leave" && action !== "donate")
    ) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (!user) throw new RouteError("User not found", 404);

      const community = await tx.community.findFirst({
        where: { id: communityId, status: "APPROVED" },
        select: { id: true },
      });
      if (!community) throw new RouteError("Community not found", 404);

      const existingDrive = await tx.drive.findUnique({
        where: { communityId_userId: { communityId, userId: user.id } },
      });

      if (action === "join") {
        if (existingDrive) throw new RouteError("Already joined", 409);

        await tx.drive.create({
          data: { userId: user.id, communityId, points: 0 },
        });
        return { action: "joined" as const };
      }

      if (!existingDrive) throw new RouteError("Join the community first", 409);

      if (action === "leave") {
        if (existingDrive.points > 0) {
          throw new RouteError(
            "Cannot leave after donating points; contact support to preserve the donation record",
            409
          );
        }

        await tx.drive.delete({ where: { id: existingDrive.id } });
        return { action: "left" as const };
      }

      const points = parseDonation(donatePoints);
      if (points === null) throw new RouteError("Invalid points", 400);

      const debit = await tx.user.updateMany({
        where: { id: user.id, points: { gte: points } },
        data: { points: { decrement: points } },
      });
      if (debit.count === 0) throw new RouteError("Insufficient points", 400);

      await tx.drive.update({
        where: { id: existingDrive.id },
        data: { points: { increment: points }, pointsDonated: true },
      });

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { points: true },
      });
      return { action: "donated" as const, remainingPoints: updatedUser.points };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof RouteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }
    console.error("Community action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
