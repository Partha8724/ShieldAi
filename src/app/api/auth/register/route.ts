import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { generateSessionToken, getSecureCookieOptions, getPublicCookieOptions } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = rateLimit(`register-${ip}`, 3);
    if (!limiter.success) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please try again in ${limiter.reset} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.reset),
          },
        }
      );
    }

    const { email, password, options } = await req.json();
    const fullName = options?.data?.full_name || null;

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailTrim },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Create user with a transaction to ensure free subscription is created as well
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: emailTrim,
          password: hashedPassword,
          name: fullName,
          role: "USER",
        },
      });

      // Get standard CREATOR plan
      let creatorPlan = await tx.plan.findUnique({
        where: { name: "CREATOR" },
      });

      // Create creator subscription (1 month free)
      await tx.subscription.create({
        data: {
          userId: newUser.id,
          planTier: "CREATOR",
          planId: creatorPlan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });


      // Log audit
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "REGISTER",
          resource: "USER",
          details: "Registered via email auth",
        },
      });

      return newUser;
    });

    // Create session token and log user in automatically
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

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

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });

    // Set cookie
    response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

    // Also set standard Supabase mock session for ease of migration if client checks both
    response.cookies.set("sb-mock-session", user.email || "", getPublicCookieOptions(expires));

    return response;
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
