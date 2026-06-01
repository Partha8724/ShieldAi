import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailTrim },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    // Verify password
    const passwordMatch = verifyPassword(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    // Handle MFA (2FA) verification check
    if (user.mfaEnabled) {
      return NextResponse.json({
        mfaRequired: true,
        userId: user.id,
      });
    }

    // Create session
    const sessionToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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
        action: "LOGIN",
        resource: "USER",
        details: `Logged in from IP: ${ip}, User Agent: ${userAgent.substring(0, 100)}`,
      },
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    // Set cookie
    response.cookies.set("sb-session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    // Cookie for mock Supabase compatibility
    response.cookies.set("sb-mock-session", user.email || "", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
