import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (sessionToken) {
      // Find session to log audit log
      const session = await prisma.session.findUnique({
        where: { sessionToken },
      });

      if (session) {
        await prisma.$transaction([
          prisma.session.delete({
            where: { sessionToken },
          }),
          prisma.auditLog.create({
            data: {
              userId: session.userId,
              action: "LOGOUT",
              resource: "USER",
              details: "Logged out manually",
            },
          }),
        ]);
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear cookies
    response.cookies.set("sb-session-token", "", { path: "/", maxAge: -1 });
    response.cookies.set("sb-mock-session", "", { path: "/", maxAge: -1 });

    return response;
  } catch (err: any) {
    console.error("Logout API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
