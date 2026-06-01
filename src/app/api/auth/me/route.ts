import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            mfaEnabled: true,
            organizationId: true,
            teamId: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ user: null });
    }

    // Refresh last active timestamp
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    return NextResponse.json({ user: session.user });
  } catch (err: any) {
    console.error("Auth me API error:", err);
    return NextResponse.json({ user: null });
  }
}
