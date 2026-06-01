import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: "PROMOTED_ADMIN",
          resource: "USER",
          details: "Self-promoted via local dev keys",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Promote API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
