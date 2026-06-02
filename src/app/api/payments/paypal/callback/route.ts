import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderID = url.searchParams.get("token");
    const userId = url.searchParams.get("userId");
    const planTier = url.searchParams.get("planTier");
    const billingCycle = url.searchParams.get("billingCycle");

    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    if (!siteUrl || (siteUrl.includes("localhost") && process.env.NODE_ENV === "production")) {
      siteUrl = url.origin;
    }

    if (!orderID || !userId || !planTier) {
      console.error("PayPal callback: Missing parameters", { orderID, userId, planTier });
      return NextResponse.redirect(`${siteUrl}/pricing?error=missing_parameters`);
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || "sandbox";
    const baseUrl = paypalMode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    let capturedAmount = 0;
    let realTransactionId = orderID;

    if (clientId && clientSecret) {
      // 1. Get Access Token
      const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!authRes.ok) {
        console.error("PayPal callback: Auth failed", await authRes.text());
        return NextResponse.redirect(`${siteUrl}/pricing?error=paypal_auth_failed`);
      }

      const { access_token } = await authRes.json();

      // 2. Capture Order
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderID}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!captureRes.ok) {
        const errText = await captureRes.text();
        console.error("PayPal callback: Capture failed", errText);
        return NextResponse.redirect(`${siteUrl}/pricing?error=paypal_capture_failed`);
      }

      const captureData = await captureRes.json();
      
      if (captureData.status !== "COMPLETED") {
        console.error("PayPal callback: Payment status is not COMPLETED", captureData.status);
        return NextResponse.redirect(`${siteUrl}/pricing?error=payment_not_completed`);
      }

      const capture = captureData.purchase_units?.[0]?.payments?.captures?.[0];
      if (capture) {
        capturedAmount = parseFloat(capture.amount?.value || "0");
        realTransactionId = capture.id || orderID;
      }
    } else {
      console.warn("PayPal callback: Credentials not set, using simulated capture");
      capturedAmount = billingCycle === "yearly" ? 99 : 9.99; // fallback
    }

    // Persist to database
    const plan = await prisma.plan.findUnique({
      where: { name: planTier.toUpperCase() },
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
          userId,
          amount: capturedAmount,
          currency: "USD",
          status: "COMPLETED",
          paymentMethod: "PAYPAL",
          transactionId: realTransactionId,
        },
      });

      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          planTier: planTier.toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: realTransactionId,
        },
        create: {
          userId,
          planTier: planTier.toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: realTransactionId,
        },
      });

      await tx.invoice.create({
        data: {
          userId,
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
          userId,
          title: "PayPal Payment Received",
          message: `Your ShieldAI ${planTier.toUpperCase()} subscription is now active! Transaction: ${realTransactionId}`,
          type: "BILLING",
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "SUBSCRIBE_PAYPAL",
          resource: "SUBSCRIPTION",
          details: `PayPal live capture redirect: ${realTransactionId}, amount $${capturedAmount}`,
        },
      });
    });

    return NextResponse.redirect(`${siteUrl}/dashboard?payment=success`);
  } catch (error) {
    console.error("PayPal callback exception:", error);
    // Try to fallback redirect to dashboard
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    if (!siteUrl) {
      siteUrl = new URL(req.url).origin;
    }
    return NextResponse.redirect(`${siteUrl}/dashboard?payment=error`);
  }
}
