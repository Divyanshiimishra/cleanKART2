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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { drives: true },
    });

    const communities = await prisma.community.findMany({
     where: { status: "APPROVED" },  // ← ye add karo
     orderBy: { members: "desc" },
     include: {
     _count: { select: { drives: true } },
     },
     });
    const joinedIds = user?.drives.map((d:any) => d.communityId) || [];

    return NextResponse.json({
      communities: communities.map((c:any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        organizer: c.organizer,
        location: c.location,
        date: c.date,
        members: c.members + c._count.drives,
        isJoined: joinedIds.includes(c.id),
      })),
      userPoints: user?.points || 0,
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

    const { communityId, action, donatePoints } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { drives: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingDrive = user.drives.find(
      (d:any) => d.communityId === communityId
    );

    // Join community
    if (action === "join" && !existingDrive) {
      await prisma.drive.create({
        data: {
          userId: user.id,
          communityId,
          points: 0,
        },
      });
      return NextResponse.json({ success: true, action: "joined" });
    }

    // Leave community
    if (action === "leave" && existingDrive) {
      await prisma.drive.delete({
        where: { id: existingDrive.id },
      });
      return NextResponse.json({ success: true, action: "left" });
    }

    // Donate points
    if (action === "donate" && donatePoints && existingDrive) {
      const pts = parseInt(donatePoints);
      if (pts <= 0 || pts > user.points) {
        return NextResponse.json({ error: "Invalid points" }, { status: 400 });
      }

      await prisma.drive.update({
        where: { id: existingDrive.id },
        data: {
          points: { increment: pts },
          pointsDonated: true,
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { points: { decrement: pts } },
      });

      return NextResponse.json({
        success: true,
        action: "donated",
        remainingPoints: updatedUser.points,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Community action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}