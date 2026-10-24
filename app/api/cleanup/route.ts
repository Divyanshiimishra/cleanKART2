import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getRequiredServerEnv } from "@/lib/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

const MAX_IMAGE_BASE64_LENGTH = 5_333_336;
const MAX_LOCATION_LENGTH = 200;

type ImageData = {
  data: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  original: string;
};

type CleanupVerification = {
  verified: boolean;
  totalPoints: number;
  severity: number;
  areaSize: number;
  properDisposal: number;
  effectiveness: number;
  reason: string;
  feedback: string;
};

function parseImageData(value: unknown): ImageData | null {
  if (typeof value !== "string") return null;

  const match = value.match(
    /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/
  );
  if (!match || match[2].length > MAX_IMAGE_BASE64_LENGTH) return null;

  return {
    mimeType: match[1] as ImageData["mimeType"],
    data: match[2],
    original: value,
  };
}

function parseBoundedInteger(value: unknown, maximum: number): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maximum
    ? value
    : null;
}

function parseVerification(value: unknown): CleanupVerification | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const result = value as Record<string, unknown>;
  const severity = parseBoundedInteger(result.severity, 40);
  const areaSize = parseBoundedInteger(result.areaSize, 30);
  const properDisposal = parseBoundedInteger(result.properDisposal, 20);
  const effectiveness = parseBoundedInteger(result.effectiveness, 10);
  const totalPoints = parseBoundedInteger(result.totalPoints, 100);

  if (
    typeof result.verified !== "boolean" ||
    severity === null ||
    areaSize === null ||
    properDisposal === null ||
    effectiveness === null ||
    totalPoints === null ||
    totalPoints !== severity + areaSize + properDisposal + effectiveness ||
    typeof result.reason !== "string" ||
    result.reason.length > 500 ||
    typeof result.feedback !== "string" ||
    result.feedback.length > 500
  ) {
    return null;
  }

  return {
    verified: result.verified,
    totalPoints,
    severity,
    areaSize,
    properDisposal,
    effectiveness,
    reason: result.reason,
    feedback: result.feedback,
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = session.user.email;

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { beforeImage, afterImage, location } = body as Record<string, unknown>;
    const before = parseImageData(beforeImage);
    const after = parseImageData(afterImage);
    const cleanupLocation =
      typeof location === "string" ? location.trim().slice(0, MAX_LOCATION_LENGTH) : "";

    if (!before || !after || !cleanupLocation) {
      return NextResponse.json(
        { error: "Valid before image, after image, and location are required" },
        { status: 400 }
      );
    }

    // 2. Gemini AI Verification
    const genAI = new GoogleGenerativeAI(getRequiredServerEnv("GEMINI_API_KEY"));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        text: `You are a cleanup verification system for a civic cleanliness app.
        
Compare these two images carefully:
- First image = BEFORE cleaning
- Second image = AFTER cleaning

Analyze these factors and give points accordingly:
1. SEVERITY (0-40 pts): How dirty was the area before? More garbage = more points
2. AREA SIZE (0-30 pts): How large was the area cleaned? Bigger area = more points
3. PROPER DISPOSAL (0-20 pts): Was garbage dumped properly in bins/bags? Yes = more points
4. EFFECTIVENESS (0-10 pts): How clean is the after photo compared to before?

Also verify:
- Is this a genuine cleanup? (not same photo, not fake)
- Is there a real visible difference?

Reply ONLY in this exact JSON format, nothing else:
{
  "verified": true or false,
  "totalPoints": number between 0-100,
  "severity": number 0-40,
  "areaSize": number 0-30,
  "properDisposal": number 0-20,
  "effectiveness": number 0-10,
  "reason": "one line explanation",
  "feedback": "one line tip for the cleaner"
}`,
      },
      {
        inlineData: {
          mimeType: before.mimeType,
          data: before.data,
        },
      },
      {
        inlineData: {
          mimeType: after.mimeType,
          data: after.data,
        },
      },
    ]);

    const aiText = result.response.text();

    let parsedResponse: unknown;
    try {
      const clean = aiText.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      parsedResponse = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { error: "Cleanup verification returned an invalid response" },
        { status: 502 }
      );
    }

    const verification = parseVerification(parsedResponse);
    if (!verification) {
      return NextResponse.json(
        { error: "Cleanup verification returned an invalid score" },
        { status: 502 }
      );
    }

    if (!verification.verified || verification.totalPoints < 10) {
      return NextResponse.json({
        success: true,
        verified: false,
        points: 0,
        totalPoints: 0,
        reason: verification.reason,
        feedback: "No cleanup detected. Try again with clearer before and after photos.",
        breakdown: {
          severity: 0,
          areaSize: 0,
          properDisposal: 0,
          effectiveness: 0,
        },
      });
    }

    const pointsEarned = verification.totalPoints;

    const { cleanup, updatedUser } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        create: {
          email,
          name: session.user.name || "Anonymous",
          image: session.user.image || "",
          points: 0,
        },
        update: {},
      });

      const cleanup = await tx.cleanup.create({
        data: {
          userId: user.id,
          location: cleanupLocation,
          beforeImage: before.original,
          afterImage: after.original,
          points: pointsEarned,
          verified: true,
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: pointsEarned } },
      });

      return { cleanup, updatedUser };
    });

    return NextResponse.json({
      success: true,
      verified: true,
      points: pointsEarned,
      totalPoints: updatedUser.points,
      cleanupId: cleanup.id,
      reason: verification.reason,
      feedback: verification.feedback,
      breakdown: {
        severity: verification.severity,
        areaSize: verification.areaSize,
        properDisposal: verification.properDisposal,
        effectiveness: verification.effectiveness,
      },
    });

  } catch (error) {
    console.error("Cleanup API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
