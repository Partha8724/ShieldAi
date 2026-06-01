import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function getRazorpayInstance() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

// Create Order
export async function POST(req: Request) {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return NextResponse.json({ error: "Razorpay is not configured. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." }, { status: 503 });
    }

    const { amount, currency = "INR", planTier, billingCycle } = await req.json();

    // Auth check
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

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: session.userId,
        planTier,
        billingCycle,
      },
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Verify Signature & Provision Subscription
export async function PUT(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay is not configured" }, { status: 503 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, planTier, amount, billingCycle } = await req.json();

    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { name: (planTier || "CREATOR").toUpperCase() },
    });

    const resolvedAmount = parseFloat(amount) || (plan?.priceMonthly || 19);
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
          amount: resolvedAmount,
          currency: "INR",
          status: "COMPLETED",
          paymentMethod: "RAZORPAY",
          transactionId: razorpay_payment_id,
        },
      });

      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          planTier: (planTier || "CREATOR").toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
        },
        create: {
          userId,
          planTier: (planTier || "CREATOR").toUpperCase(),
          planId: plan?.id || null,
          status: "ACTIVE",
          currentPeriodEnd,
        },
      });

      await tx.invoice.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: resolvedAmount,
          currency: "INR",
          status: "PAID",
          invoiceNumber,
          dueDate: new Date(),
          paidAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId,
          title: "Payment Received via Razorpay",
          message: `Your ShieldAI ${(planTier || "Creator").toUpperCase()} subscription is now active!`,
          type: "BILLING",
        },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: "SUBSCRIBE_RAZORPAY",
          resource: "SUBSCRIPTION",
          details: `Razorpay payment ${razorpay_payment_id}, amount ₹${resolvedAmount}`,
        },
      });
    });

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Razorpay Verification Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
