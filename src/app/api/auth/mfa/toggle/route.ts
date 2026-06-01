import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enabled } = await req.json();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: {
          mfaEnabled: !!enabled,
          mfaSecret: enabled ? "LOCAL_TEST_SECRET_KEY" : null,
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: enabled ? "MFA_ENABLED" : "MFA_DISABLED",
          resource: "USER",
          details: enabled ? "Enabled two-factor authentication" : "Disabled two-factor authentication",
        },
      }),
    ]);

    return NextResponse.json({ success: true, mfaEnabled: !!enabled });
  } catch (err: any) {
    console.error("MFA toggle error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
