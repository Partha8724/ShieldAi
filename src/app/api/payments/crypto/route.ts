import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

// Coinbase Commerce Webhook Signature Verification helper
function verifyCoinbaseSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const computedSignature = createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    return computedSignature === signature;
  } catch (error) {
    console.error("Coinbase signature verification error:", error);
    return false;
  }
}

// Coinbase Commerce Webhook Handler
// Handles events: charge:confirmed, charge:resolved, charge:failed, charge:created, etc.
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-cc-webhook-signature") || "";
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;

    // Verify webhook signature if secret and signature are present
    if (webhookSecret && signature) {
      const isVerified = verifyCoinbaseSignature(rawBody, signature, webhookSecret);
      if (!isVerified) {
        console.error("Coinbase Commerce webhook signature mismatch");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    } else {
      console.warn("Coinbase Commerce webhook signature check skipped (webhook secret or signature missing).");
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event?.type;
    const eventData = payload.event?.data;

    if (!eventType || !eventData) {
      console.error("Invalid Coinbase Commerce webhook payload structure");
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 });
    }

    const chargeId = eventData.id;
    const metadata = eventData.metadata;

    if (!chargeId || !metadata) {
      console.warn("Coinbase Commerce webhook missing charge id or metadata. Skipping event:", eventType);
      return NextResponse.json({ success: true, message: "Skipped (no metadata/chargeId)" });
    }

    const { userId, planTier, billingCycle } = metadata;

    if (!userId || !planTier) {
      console.error("Coinbase Commerce webhook metadata missing userId or planTier", metadata);
      return NextResponse.json({ error: "Missing metadata parameters" }, { status: 400 });
    }

    const resolvedPlanTier = planTier.toUpperCase();
    const txId = `COINBASE-${chargeId}`;

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.error("Coinbase Commerce webhook user not found in database:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resolvedAmount = parseFloat(eventData.payments?.[0]?.value?.local?.amount) || parseFloat(eventData.pricing?.local?.amount) || 0;
    const priceCurrency = eventData.payments?.[0]?.value?.local?.currency || eventData.pricing?.local?.currency || "USD";

    if (eventType === "charge:confirmed" || eventType === "charge:resolved") {
      const plan = await prisma.plan.findUnique({
        where: { name: resolvedPlanTier },
      });

      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const currentPeriodEnd = new Date();
      if (billingCycle === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      } else {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      await prisma.$transaction(async (tx) => {
        // 1. Create or Update Payment
        await tx.payment.upsert({
          where: { transactionId: txId },
          update: { status: "COMPLETED" },
          create: {
            userId,
            amount: resolvedAmount,
            currency: priceCurrency.toUpperCase(),
            status: "COMPLETED",
            paymentMethod: "CRYPTO",
            transactionId: txId,
          },
        });

        // 2. Create or Update Subscription
        const subscription = await tx.subscription.upsert({
          where: { userId },
          update: {
            planTier: resolvedPlanTier,
            planId: plan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd,
          },
          create: {
            userId,
            planTier: resolvedPlanTier,
            planId: plan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd,
          },
        });

        // 3. Create Invoice record
        await tx.invoice.create({
          data: {
            userId,
            subscriptionId: subscription.id,
            amount: resolvedAmount,
            currency: priceCurrency.toUpperCase(),
            status: "PAID",
            invoiceNumber,
            dueDate: new Date(),
            paidAt: new Date(),
          },
        });

        // 4. Create Notification
        await tx.notification.create({
          data: {
            userId,
            title: "Crypto Payment Confirmed",
            message: `Your ShieldAI ${resolvedPlanTier} plan subscription has been successfully activated via Coinbase Commerce.`,
            type: "BILLING",
          },
        });

        // 5. Create Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            action: "SUBSCRIBE_CRYPTO",
            resource: "SUBSCRIPTION",
            details: `Coinbase Commerce webhook confirmed charge: ${chargeId}, amount: $${resolvedAmount}`,
          },
        });
      });

      console.log(`Coinbase Commerce subscription provisioned successfully for user ${userId}`);
    } else if (eventType === "charge:failed") {
      await prisma.$transaction(async (tx) => {
        // Update payment status to FAILED
        await tx.payment.updateMany({
          where: { transactionId: txId },
          data: { status: "FAILED" },
        });

        // Create alert/notification
        await tx.notification.create({
          data: {
            userId,
            title: "Crypto Payment Failed",
            message: `Your cryptocurrency transaction via Coinbase Commerce has failed. Charge ID: ${chargeId}`,
            type: "BILLING",
          },
        });
      });
      console.log(`Coinbase Commerce subscription failed status processed for user ${userId}`);
    } else {
      console.log(`Coinbase Commerce webhook status check: ${eventType} (no action taken)`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Coinbase Commerce webhook exception:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 400 });
  }
}
