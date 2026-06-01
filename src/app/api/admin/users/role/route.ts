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
      include: { user: true },
    });

    if (!session || session.expires < new Date() || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized admin access required" }, { status: 403 });
    }

    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "MODIFY_USER_ROLE",
          resource: "USER",
          details: `Updated role of user ${userId} to ${role}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Role toggle error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
