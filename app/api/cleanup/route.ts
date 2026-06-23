import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // 1. Check if user is logged in
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { beforeImage, afterImage, location } = await req.json();

    if (!beforeImage || !afterImage || !location) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // 2. Gemini AI Verification
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const beforeBase64 = beforeImage.replace(/^data:image\/\w+;base64,/, "");
    const afterBase64 = afterImage.replace(/^data:image\/\w+;base64,/, "");

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
          mimeType: "image/jpeg",
          data: beforeBase64,
        },
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: afterBase64,
        },
      },
    ]);

    const aiText = result.response.text();

    let verification = {
      verified: false,
      totalPoints: 0,
      severity: 0,
      areaSize: 0,
      properDisposal: 0,
      effectiveness: 0,
      reason: "Verification failed",
      feedback: "",
    };

    try {
      const clean = aiText.replace(/```json|```/g, "").trim();
      verification = JSON.parse(clean);
    } catch {
      verification = {
        verified: false,
        totalPoints: 0,
        severity: 0,
        areaSize: 0,
        properDisposal: 0,
        effectiveness: 0,
        reason: "Could not parse AI response",
        feedback: "",
      };
    }

    // 3. If not verified
    // 3. If not verified — 0 points milenge but error nahi
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

    // 4. Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || "Anonymous",
          image: session.user.image || "",
          points: 0,
        },
      });
    }

    // 5. Points earned
    const pointsEarned = verification.totalPoints;

    // 6. Save cleanup
    const cleanup = await prisma.cleanup.create({
      data: {
        userId: user.id,
        location,
        beforeImage,
        afterImage,
        points: pointsEarned,
        verified: true,
      },
    });

    // 7. Update user points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsEarned } },
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