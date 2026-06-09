import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, getSecureCookieOptions, getPublicCookieOptions } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "Missing userId or verification code" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // Local 2FA validation: accept code "123456" as the standard test code
    if (code !== "123456") {
      return NextResponse.json({ error: "Invalid two-factor code. Try 123456." }, { status: 400 });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN_MFA_SUCCESS",
        resource: "USER",
        details: `Successful 2FA login from IP: ${ip}`,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

    response.cookies.set("sb-mock-session", user.email || "", getPublicCookieOptions(expires));

    return response;
  } catch (err: any) {
    console.error("2FA Verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
