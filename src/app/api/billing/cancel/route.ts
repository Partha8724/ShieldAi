import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get FREE plan
    const freePlan = await prisma.plan.findUnique({
      where: { name: "FREE" },
    });

    // Update to Free Plan
    await prisma.$transaction([
      prisma.subscription.update({
        where: { userId: session.userId },
        data: {
          planTier: "FREE",
          planId: freePlan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd: null,
          paypalSubscriptionId: null,
        },
      }),
      prisma.notification.create({
        data: {
          userId: session.userId,
          title: "Subscription Cancelled",
          message: "Your subscription has been cancelled and downgraded to the Free tier.",
          type: "BILLING",
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "CANCEL_SUBSCRIPTION",
          resource: "SUBSCRIPTION",
          details: "Downgraded to FREE plan subscription",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Subscription cancel error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
