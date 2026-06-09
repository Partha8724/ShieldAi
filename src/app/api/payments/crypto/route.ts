import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";

// NOWPayments IPN Webhook Signature Verification helper
function verifyNewpaymentSignature(
  rawBody: string,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    const payload = JSON.parse(rawBody);
    
    // Sort keys alphabetically as required by NOWPayments signature algorithm
    const sortedPayload: Record<string, any> = {};
    Object.keys(payload)
      .sort()
      .forEach((key) => {
        sortedPayload[key] = payload[key];
      });

    // Create sorted JSON string
    const sortedString = JSON.stringify(sortedPayload);
    
    const computedSignature = createHmac("sha512", webhookSecret)
      .update(sortedString)
      .digest("hex");

    return computedSignature === signature;
  } catch (error) {
    console.error("Newpayment signature verification error:", error);
    return false;
  }
}

// Newpayment Webhook Handler (NOWPayments IPN)
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig") || "";
    const webhookSecret = process.env.NEWPAYMENT_WEBHOOK_SECRET;

    // Verify webhook signature if secret and signature are present
    if (webhookSecret && signature) {
      const isVerified = verifyNewpaymentSignature(rawBody, signature, webhookSecret);
      if (!isVerified) {
        console.error("Newpayment webhook signature mismatch");
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    } else {
      console.warn("Newpayment webhook signature check skipped (webhook secret or signature missing).");
    }

    const payload = JSON.parse(rawBody);
    const { payment_status, payment_id, order_id, price_amount, price_currency } = payload;

    if (!order_id) {
      console.error("Newpayment webhook missing order_id");
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    // Parse metadata from order_id (format: userId:planTier:billingCycle:timestamp)
    const parts = order_id.split(":");
    if (parts.length < 3) {
      console.error("Invalid Newpayment order_id format:", order_id);
      return NextResponse.json({ error: "Invalid order_id format" }, { status: 400 });
    }

    const userId = parts[0];
    const planTier = parts[1].toUpperCase();
    const billingCycle = parts[2];
    const resolvedAmount = parseFloat(price_amount) || 0;
    const txId = `NEWPAY-${payment_id || Date.now()}`;

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.error("Newpayment webhook user not found in database:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (payment_status === "confirmed" || payment_status === "finished") {
      const plan = await prisma.plan.findUnique({
        where: { name: planTier },
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
            currency: price_currency ? price_currency.toUpperCase() : "USD",
            status: "COMPLETED",
            paymentMethod: "CRYPTO",
            transactionId: txId,
          },
        });

        // 2. Create or Update Subscription
        const subscription = await tx.subscription.upsert({
          where: { userId },
          update: {
            planTier,
            planId: plan?.id || null,
            status: "ACTIVE",
            currentPeriodEnd,
          },
          create: {
            userId,
            planTier,
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
            currency: price_currency ? price_currency.toUpperCase() : "USD",
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
            message: `Your ShieldAI ${planTier} plan subscription has been successfully activated via Newpayment.`,
            type: "BILLING",
          },
        });

        // 5. Create Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            action: "SUBSCRIBE_CRYPTO",
            resource: "SUBSCRIPTION",
            details: `Newpayment IPN confirmed, payment ID: ${payment_id}, amount: $${resolvedAmount}`,
          },
        });
      });

      console.log(`Newpayment subscription provisioned successfully for user ${userId}`);
    } else if (payment_status === "failed" || payment_status === "expired") {
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
            message: `Your cryptocurrency transaction via Newpayment has failed or expired. Status: ${payment_status}`,
            type: "BILLING",
          },
        });
      });
      console.log(`Newpayment subscription failed status processed for user ${userId}`);
    } else {
      console.log(`Newpayment webhook status check: ${payment_status} (no action taken)`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Newpayment webhook exception:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 400 });
  }
}
