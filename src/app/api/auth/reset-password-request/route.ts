import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/security";
import { getCleanSiteUrl } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = rateLimit(`reset-pwd-${ip}`, 3);
    if (!limiter.success) {
      return NextResponse.json(
        { error: `Too many password reset requests. Please try again in ${limiter.reset} seconds.` },
        {
          status: 429,
          headers: {
            "Retry-After": String(limiter.reset),
          },
        }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const emailTrim = email.trim().toLowerCase();

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email: emailTrim },
    });

    if (!user) {
      // Return success even if email not found to prevent user enumeration, standard security practice
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = generateVerificationToken();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store in DB
    await prisma.verificationToken.upsert({
      where: { token },
      update: { identifier: emailTrim, expires },
      create: { identifier: emailTrim, token, expires },
    });

    // Dynamic reset link
    const siteUrl = getCleanSiteUrl(req);
    const resetLink = `${siteUrl}/reset-password?token=${token}`;
    console.log("----------------------------------------");
    console.log("PASSWORD RESET REQUESTED FOR:", emailTrim);
    console.log("RESET LINK:", resetLink);
    console.log("----------------------------------------");

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUEST",
        resource: "USER",
        details: "Requested reset token",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset password request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
