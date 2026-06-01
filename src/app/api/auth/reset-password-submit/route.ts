import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }

    // Find token
    const tokenRecord = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "Token has expired or is invalid" }, { status: 400 });
    }

    const email = tokenRecord.identifier;

    // Hash password
    const hashedPassword = hashPassword(newPassword);

    // Update user in transaction and delete verification token
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    // Audit log
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_SUBMIT",
          resource: "USER",
          details: "Reset password successfully using token",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset password submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
