import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { generateSessionToken, generateReferralCode, getSecureCookieOptions, getPublicCookieOptions } from "@/lib/security";
import { getCleanSiteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, useCase, referralSource, referredByCode } = body;

    if (!email || typeof email !== "string" || !email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();

    // Check if email already in waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email: emailTrim },
    });

    if (existing) {
      // Ensure User and Session exist so they can redirect to dashboard
      let user = await prisma.user.findUnique({ where: { email: emailTrim } });
      if (!user) {
        const hashedPassword = hashPassword("password123");
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: emailTrim,
              password: hashedPassword,
              name: name || "Waitlist Member",
              role: "USER",
            },
          });
          const creatorPlan = await tx.plan.findUnique({ where: { name: "CREATOR" } });
          await tx.subscription.create({
            data: {
              userId: newUser.id,
              planTier: "CREATOR",
              planId: creatorPlan?.id || null,
              status: "ACTIVE",
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
          return newUser;

        });
      }

      // Create session
      const sessionToken = generateSessionToken();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || "unknown",
        },
      });

      const response = NextResponse.json({
        success: true,
        alreadyExists: true,
        waitlist: existing,
      });

      response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

      response.cookies.set("sb-mock-session", user.email || "", getPublicCookieOptions(expires));

      return response;
    }

    // Generate unique referral code for this user
    const cleanName = name || "Waitlist Member";
    const userInitials = cleanName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "SHD";
    const referralCode = `REF-${userInitials}-${generateReferralCode().slice(0, 4)}`;

    // Track referral
    let referredById: string | null = null;
    if (referredByCode) {
      const referrer = await prisma.waitlist.findUnique({
        where: { referralCode: referredByCode },
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // Determine rank (default is last in queue)
    const totalCount = await prisma.waitlist.count();
    const rank = totalCount + 1;

    // Save waitlist record
    const waitlist = await prisma.waitlist.create({
      data: {
        name: name || "Waitlist Member",
        email: emailTrim,
        company: company || null,
        useCase: useCase || null,
        referralSource: referralSource || null,
        referralCode,
        referredById,
        rank,
        status: "PENDING",
      },
    });

    // Dynamic queue repositioning based on referral stats
    if (referredById) {
      // Find count of referrals by referrer
      const referralCount = await prisma.waitlist.count({
        where: { referredById },
      });

      // Boost referrer's rank in queue (move them up by 5 slots for every referral!)
      const referrer = await prisma.waitlist.findUnique({ where: { id: referredById } });
      if (referrer && referrer.rank > 5) {
        const newRank = Math.max(1, referrer.rank - 5);
        await prisma.waitlist.update({
          where: { id: referredById },
          data: { rank: newRank },
        });
      }
    }

    // Create user if not exists
    let user = await prisma.user.findUnique({ where: { email: emailTrim } });
    if (!user) {
      const hashedPassword = hashPassword("password123");
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: emailTrim,
            password: hashedPassword,
            name: name || "Waitlist Member",
            role: "USER",
          },
        });
        const creatorPlan = await tx.plan.findUnique({ where: { name: "CREATOR" } });
        await tx.subscription.create({
          data: {
            userId: newUser.id,
            planTier: "CREATOR",
            planId: creatorPlan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        return newUser;
      });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: req.headers.get("user-agent") || "unknown",
      },
    });

    // Simulate sending email confirmation
    console.log("----------------------------------------");
    console.log("EMAIL CONFIRMATION SENT TO:", emailTrim);
    console.log("SUBJECT: Welcome to ShieldAI Early Access!");
    console.log("MESSAGE: Thank you for requesting early access. Your position in the queue is #" + rank);
    const siteUrl = getCleanSiteUrl(req);
    console.log("REF LINK: " + siteUrl + "/waitlist?ref=" + referralCode);
    console.log("----------------------------------------");

    const response = NextResponse.json({
      success: true,
      waitlist,
    });

    response.cookies.set("sb-session-token", sessionToken, getSecureCookieOptions(expires));

    response.cookies.set("sb-mock-session", user.email || "", getPublicCookieOptions(expires));

    return response;
  } catch (err: any) {
    console.error("Waitlist API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
