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

    const { leadId, status } = await req.json();

    if (!leadId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.salesLead.update({
        where: { id: leadId },
        data: { status },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "UPDATE_LEAD_STATUS",
          resource: "SALES_LEAD",
          details: `Updated sales lead ${leadId} status to ${status}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Lead status update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
