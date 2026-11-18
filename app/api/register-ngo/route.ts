import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { name, description, organizer, email, phone, website, location, date } = body as {
      name?: unknown;
      description?: unknown;
      organizer?: unknown;
      email?: unknown;
      phone?: unknown;
      website?: unknown;
      location?: unknown;
      date?: unknown;
    };

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof organizer !== "string" ||
      typeof email !== "string" ||
      typeof location !== "string" ||
      typeof date !== "string"
    ) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) {
      return NextResponse.json({ error: "Invalid event date" }, { status: 400 });
    }

    const community = await prisma.community.create({
      data: {
        name,
        description,
        organizer,
        email,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        website: typeof website === "string" && website.trim() ? website.trim() : null,
        location,
        date: eventDate,
        status: "PENDING",
        members: 0,
      },
    });

    return NextResponse.json({
      success: true,
      communityId: community.id,
      message: "Registration submitted for review!",
    });
  } catch (error) {
    console.error("NGO Registration error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: "Internal server error", detail: message },
      { status: 500 },
    );
  }
}
