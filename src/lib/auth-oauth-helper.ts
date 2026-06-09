import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCleanSiteUrl } from "@/lib/utils";
import { generateSessionToken, generateSecureId, getSecureCookieOptions, getPublicCookieOptions } from "@/lib/security";

export async function handleUserAuth(email: string, name: string, provider: string, req: Request) {
  const emailTrim = email.trim().toLowerCase();
  const providerAccountId = generateSecureId(`${provider}-id`);
  const siteUrl = getCleanSiteUrl(req);

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

      // Provision CREATOR Subscription (1 month free)
      const creatorPlan = await tx.plan.findUnique({
        where: { name: "CREATOR" },
      });

      await tx.subscription.create({
        data: {
          userId: newUser.id,
          planTier: "CREATOR",
          planId: creatorPlan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });


      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: "REGISTER_OAUTH",
          resource: "USER",
          details: `Registered via ${provider} OAuth`,
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

  const response = NextResponse.redirect(`${siteUrl}/dashboard`);

  // Set HttpOnly session token cookie
  response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

  // compatibility cookie (non-sensitive, client-readable)
  response.cookies.set("sb-mock-session", user!.email || "", getPublicCookieOptions(expires));

  return response;
}
