import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, generateSecureId, getSecureCookieOptions, getPublicCookieOptions } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const { email, name, provider } = await req.json();

    if (!email || !provider) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();
    const providerAccountId = generateSecureId(`${provider}-id`);

    let user = await prisma.user.findUnique({
      where: { email: emailTrim },
      include: { accounts: true },
    });

    if (!user) {
      // Create new user via OAuth
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: emailTrim,
            name: name,
            role: "USER",
          },
        });

        // Link Account
        await tx.account.create({
          data: {
            userId: newUser.id,
            type: "oauth",
            provider,
            providerAccountId,
          },
        });

        // Provision FREE Subscription
        const freePlan = await tx.plan.findUnique({
          where: { name: "FREE" },
        });

        await tx.subscription.create({
          data: {
            userId: newUser.id,
            planTier: "FREE",
            planId: freePlan?.id || null,
            status: "ACTIVE",
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            userId: newUser.id,
            action: "REGISTER_OAUTH",
            resource: "USER",
            details: `Registered via ${provider} OAuth consent`,
          },
        });

        return newUser;
      }) as any;
    } else {
      // User exists, verify if Account linked, if not link it
      const hasAccountLinked = user.accounts.some((acc) => acc.provider === provider);
      if (!hasAccountLinked) {
        await prisma.$transaction([
          prisma.account.create({
            data: {
              userId: user.id,
              type: "oauth",
              provider,
              providerAccountId,
            },
          }),
          prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "LINK_OAUTH",
              resource: "USER",
              details: `Linked ${provider} OAuth to existing email`,
            },
          }),
        ]);
      }
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user!.id,
        expires,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user!.id,
        action: "LOGIN_OAUTH",
        resource: "USER",
        details: `Logged in via ${provider} OAuth from IP: ${ip}`,
      },
    });

    const response = NextResponse.json({ success: true });

    // Set HttpOnly session token cookie
    response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

    // compatibility cookie
    response.cookies.set("sb-mock-session", user!.email || "", getPublicCookieOptions(expires));

    return response;
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
