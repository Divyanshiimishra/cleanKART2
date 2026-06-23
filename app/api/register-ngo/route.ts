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

    const { name, description, organizer, email, phone, website, location, date } =
      await req.json();

    if (!name || !description || !organizer || !email || !location || !date) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const community = await prisma.community.create({
      data: {
        name,
        description,
        organizer,
        email,
        phone: phone || null,
        website: website || null,
        location,
        date: new Date(date),
        status: "APPROVED",
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}