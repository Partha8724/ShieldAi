import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" as any });

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Direct parsing fallback for manual calls or sandbox tests
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata && metadata.userId && metadata.planTier) {
        const userId = metadata.userId;
        const planTier = metadata.planTier.toUpperCase();
        const billingCycle = metadata.billingCycle;

        // Find the plan details
        const plan = await prisma.plan.findUnique({
          where: { name: planTier },
        });

        const amount = billingCycle === "yearly" ? (plan?.priceYearly || 190) : (plan?.priceMonthly || 19);
        const transactionId = session.id;
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

        const currentPeriodEnd = new Date();
        if (billingCycle === "yearly") {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        } else {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }

        await prisma.$transaction(async (tx) => {
          // 1. Create Payment record
          await tx.payment.create({
            data: {
              userId,
              amount,
              currency: "USD",
              status: "COMPLETED",
              paymentMethod: "STRIPE",
              transactionId,
            },
          });

          // 2. Create or Update Subscription
          const sub = await tx.subscription.upsert({
            where: { userId },
            update: {
              planTier,
              planId: plan?.id || null,
              status: "ACTIVE",
              currentPeriodEnd,
              paypalSubscriptionId: transactionId,
            },
            create: {
              userId,
              planTier,
              planId: plan?.id || null,
              status: "ACTIVE",
              currentPeriodEnd,
              paypalSubscriptionId: transactionId,
            },
          });

          // 3. Create Invoice
          await tx.invoice.create({
            data: {
              userId,
              subscriptionId: sub.id,
              amount,
              currency: "USD",
              status: "PAID",
              invoiceNumber,
              dueDate: new Date(),
              paidAt: new Date(),
            },
          });

          // 4. Create real-time notification
          await tx.notification.create({
            data: {
              userId,
              title: "Payment Received",
              message: `Your ShieldAI ${planTier} subscription is now active!`,
              type: "BILLING",
            },
          });

          // 5. Create Audit Log
          await tx.auditLog.create({
            data: {
              userId,
              action: "SUBSCRIBE_WEBHOOK",
              resource: "SUBSCRIPTION",
              details: `Provisioned plan ${planTier} via Stripe webhook checkout.session.completed`,
            },
          });
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
