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

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing waitlist ID" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.waitlist.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "APPROVE_WAITLIST",
          resource: "WAITLIST",
          details: `Approved waitlist entry ID: ${id}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Waitlist approve error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
