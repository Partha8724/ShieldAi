import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// PayPal subscription handler - creates subscription via PayPal or local DB fallback
export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!session || session.expires < new Date() || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planTier, amount, billingCycle } = await req.json();

    if (!planTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { name: planTier.toUpperCase() },
    });

    const resolvedAmount = parseFloat(amount) || (billingCycle === "yearly" ? (plan?.priceYearly || 190) : (plan?.priceMonthly || 19));
    const transactionId = `PAYPAL-${Math.random().toString(36).substring(2).toUpperCase()}-${Date.now()}`;
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentPeriodEnd = new Date();
    if (billingCycle === "yearly") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      await tx.payment.create({
        data: {
          userId: session.userId,
          amount: resolvedAmount,
          currency: "USD",
          status: "COMPLETED",
          paymentMethod: "PAYPAL",
          transactionId,
        },
      });

      // 2. Provision or update the Subscription
      const subscription = await tx.subscription.upsert({
        where: { userId: session.userId },
        update: {
          planTier: planTier.toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: transactionId,
        },
        create: {
          userId: session.userId,
          planTier: planTier.toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: transactionId,
        },
      });

      // 3. Create Invoice
      await tx.invoice.create({
        data: {
          userId: session.userId,
          subscriptionId: subscription.id,
          amount: resolvedAmount,
          currency: "USD",
          status: "PAID",
          invoiceNumber,
          dueDate: new Date(),
          paidAt: new Date(),
        },
      });

      // 4. Create notification
      await tx.notification.create({
        data: {
          userId: session.userId,
          title: "PayPal Payment Received",
          message: `Your ShieldAI ${planTier.toUpperCase()} subscription is now active!`,
          type: "BILLING",
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "SUBSCRIBE_PAYPAL",
          resource: "SUBSCRIPTION",
          details: `Subscribed to ${planTier.toUpperCase()} via PayPal, Amount: $${resolvedAmount}`,
        },
      });

      return subscription;
    });

    return NextResponse.json({ success: true, subscription: result });
  } catch (error) {
    console.error("PayPal processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
