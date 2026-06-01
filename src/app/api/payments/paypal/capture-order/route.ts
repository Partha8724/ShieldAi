import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { orderID, userId, planTier, amount, billingCycle } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "Missing orderID" }, { status: 400 });
    }

    // Resolve authenticated user from session cookie
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("sb-session-token")?.value;
    let resolvedUserId = userId;

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (session && session.expires > new Date()) {
        resolvedUserId = session.userId;
      }
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || "sandbox";
    const baseUrl = paypalMode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    let capturedAmount = parseFloat(amount) || 0;
    let realTransactionId = orderID;

    // If real PayPal credentials are configured, capture the order via API
    if (clientId && clientSecret) {
      const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!authRes.ok) {
        console.error("PayPal auth failed:", await authRes.text());
        return NextResponse.json({ error: "PayPal authentication failed" }, { status: 502 });
      }

      const { access_token } = await authRes.json();

      // Capture the order
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!captureRes.ok) {
        const errText = await captureRes.text();
        console.error("PayPal capture failed:", errText);
        return NextResponse.json({ error: "PayPal capture failed", details: errText }, { status: 502 });
      }

      const captureData = await captureRes.json();
      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      if (capture) {
        capturedAmount = parseFloat(capture.amount?.value || "0");
        realTransactionId = capture.id || orderID;
      }

      if (captureData.status !== "COMPLETED") {
        return NextResponse.json({ error: "Payment not completed", status: captureData.status }, { status: 400 });
      }
    }

    // Persist to database
    if (resolvedUserId) {
      const plan = await prisma.plan.findUnique({
        where: { name: (planTier || "CREATOR").toUpperCase() },
      });

      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const currentPeriodEnd = new Date();
      if (billingCycle === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            userId: resolvedUserId,
            amount: capturedAmount,
            currency: "USD",
            status: "COMPLETED",
            paymentMethod: "PAYPAL",
            transactionId: realTransactionId,
          },
        });

        const subscription = await tx.subscription.upsert({
          where: { userId: resolvedUserId },
          update: {
            planTier: (planTier || "CREATOR").toUpperCase(),
            planId: plan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd,
            paypalSubscriptionId: realTransactionId,
          },
          create: {
            userId: resolvedUserId,
            planTier: (planTier || "CREATOR").toUpperCase(),
            planId: plan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd,
            paypalSubscriptionId: realTransactionId,
          },
        });

        await tx.invoice.create({
          data: {
            userId: resolvedUserId,
            subscriptionId: subscription.id,
            amount: capturedAmount,
            currency: "USD",
            status: "PAID",
            invoiceNumber,
            dueDate: new Date(),
            paidAt: new Date(),
          },
        });

        await tx.notification.create({
          data: {
            userId: resolvedUserId,
            title: "PayPal Payment Received",
            message: `Your ShieldAI ${(planTier || "Creator").toUpperCase()} subscription is now active! Transaction: ${realTransactionId}`,
            type: "BILLING",
          },
        });

        await tx.auditLog.create({
          data: {
            userId: resolvedUserId,
            action: "SUBSCRIBE_PAYPAL",
            resource: "SUBSCRIPTION",
            details: `PayPal capture ${realTransactionId}, amount $${capturedAmount}`,
          },
        });
      });
    }

    return NextResponse.json({ success: true, verified: true, transactionId: realTransactionId });
  } catch (error) {
    console.error("PayPal capture-order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
