import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Stripe from "stripe";

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

    const { planTier, billingCycle, paymentMethod } = await req.json();

    if (!planTier || !billingCycle || !paymentMethod) {
      return NextResponse.json({ error: "Missing checkout parameters" }, { status: 400 });
    }

    const plan = await prisma.plan.findUnique({
      where: { name: planTier.toUpperCase() },
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan tier" }, { status: 400 });
    }

    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

    // Check if Stripe client keys are set for original working payments
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (stripeSecret && paymentMethod.toLowerCase() === "stripe") {
      const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" as any });
      let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      if (!siteUrl || (siteUrl.includes("localhost") && process.env.NODE_ENV === "production")) {
        siteUrl = new URL(req.url).origin;
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `ShieldAI ${plan.name} Plan`,
                description: billingCycle === "yearly" ? "Yearly protection license" : "Monthly protection license",
              },
              unit_amount: amount * 100, // cents
              recurring: {
                interval: billingCycle === "yearly" ? "year" : "month",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${siteUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/pricing`,
        customer_email: session.user.email || undefined,
        metadata: {
          userId: session.userId,
          planTier: plan.name,
          billingCycle,
        },
      });

      return NextResponse.json({ success: true, url: stripeSession.url });
    }

    if (paymentMethod.toLowerCase() === "crypto") {
      const apiKey = process.env.NOWPAYMENTS_API_KEY;
      let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
      if (!siteUrl || (siteUrl.includes("localhost") && process.env.NODE_ENV === "production")) {
        siteUrl = new URL(req.url).origin;
      }

      if (apiKey) {
        const isSandbox = process.env.NOWPAYMENTS_SANDBOX === "true";
        const nowpaymentsUrl = isSandbox 
          ? "https://api-sandbox.nowpayments.io/v1/invoice" 
          : "https://api.nowpayments.io/v1/invoice";

        try {
          const res = await fetch(nowpaymentsUrl, {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              price_amount: amount,
              price_currency: "usd",
              order_id: `${session.userId}:${plan.name}:${billingCycle}:${Date.now()}`,
              order_description: `ShieldAI ${plan.name} Plan (${billingCycle})`,
              success_url: `${siteUrl}/dashboard?payment=success`,
              cancel_url: `${siteUrl}/pricing`,
              ipn_callback_url: `${siteUrl}/api/payments/crypto`,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error("NOWPayments invoice creation failed:", errText);
            return NextResponse.json({ error: `NOWPayments error: ${errText}` }, { status: 502 });
          }

          const invoiceData = await res.json();

          // Create a pending payment in our database
          await prisma.payment.create({
            data: {
              userId: session.userId,
              amount,
              currency: "USD",
              status: "PENDING",
              paymentMethod: "CRYPTO",
              transactionId: `NOWPAY-${invoiceData.id || invoiceData.invoice_id}`,
            },
          });

          return NextResponse.json({ success: true, url: invoiceData.invoice_url });
        } catch (error) {
          console.error("NOWPayments checkout error:", error);
          return NextResponse.json({ error: "Failed to connect to NOWPayments" }, { status: 502 });
        }
      } else {
        // Fallback: mock NOWPayments invoice redirection link for development
        console.warn("NOWPAYMENTS_API_KEY is not set. Using local development simulator fallback.");
        const mockInvoiceId = `MOCK-NOWPAY-${Date.now()}`;
        
        // Register pending payment in the database
        await prisma.payment.create({
          data: {
            userId: session.userId,
            amount,
            currency: "USD",
            status: "PENDING",
            paymentMethod: "CRYPTO",
            transactionId: mockInvoiceId,
          },
        });

        // Auto-complete the subscription in the database immediately for development simulation
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
        const currentPeriodEnd = new Date();
        if (billingCycle === "yearly") {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        } else {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }

        await prisma.$transaction(async (tx) => {
          // Update the payment status to COMPLETED
          await tx.payment.update({
            where: { transactionId: mockInvoiceId },
            data: { status: "COMPLETED" },
          });

          // Create or update subscription
          const subscription = await tx.subscription.upsert({
            where: { userId: session.userId },
            update: {
              planTier: plan.name,
              planId: plan.id,
              status: "ACTIVE",
              currentPeriodEnd,
            },
            create: {
              userId: session.userId,
              planTier: plan.name,
              planId: plan.id,
              status: "ACTIVE",
              currentPeriodEnd,
            },
          });

          // Create Invoice
          await tx.invoice.create({
            data: {
              userId: session.userId,
              subscriptionId: subscription.id,
              amount,
              currency: "USD",
              status: "PAID",
              invoiceNumber,
              dueDate: new Date(),
              paidAt: new Date(),
            },
          });

          // Notification
          await tx.notification.create({
            data: {
              userId: session.userId,
              title: "Crypto Subscription Activated",
              message: `Your ShieldAI ${plan.name} plan is active via simulated NOWPayments.`,
              type: "BILLING",
            },
          });

          // Audit Log
          await tx.auditLog.create({
            data: {
              userId: session.userId,
              action: "SUBSCRIBE_CRYPTO",
              resource: "SUBSCRIPTION",
              details: `Simulated NOWPayments crypto checkout confirmed for ${plan.name}`,
            },
          });
        });

        // Redirect to a local success simulation URL
        return NextResponse.json({ 
          success: true, 
          url: `${siteUrl}/dashboard?payment=success&mock_crypto_invoice=${mockInvoiceId}` 
        });
      }
    }

    // Fallback to offline developer payment simulation (writing directly to local db)
    const transactionId = `${paymentMethod.toUpperCase()}-${Math.random().toString(36).substring(2).toUpperCase()}`;
    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const currentPeriodEnd = new Date();
    if (billingCycle === "yearly") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment
      const payment = await tx.payment.create({
        data: {
          userId: session.userId,
          amount,
          currency: "USD",
          status: "COMPLETED",
          paymentMethod: paymentMethod.toUpperCase(),
          transactionId,
        },
      });

      // 2. Create or Update Subscription
      const subscription = await tx.subscription.upsert({
        where: { userId: session.userId },
        update: {
          planTier: plan.name,
          planId: plan.id,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: transactionId,
        },
        create: {
          userId: session.userId,
          planTier: plan.name,
          planId: plan.id,
          status: "ACTIVE",
          currentPeriodEnd,
          paypalSubscriptionId: transactionId,
        },
      });

      // 3. Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          userId: session.userId,
          subscriptionId: subscription.id,
          amount,
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
          title: "Subscription Activated",
          message: `Your ShieldAI ${plan.name} plan subscription has been successfully provisioned. Transaction ID: ${transactionId}.`,
          type: "BILLING",
        },
      });

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.userId,
          action: "SUBSCRIBE",
          resource: "SUBSCRIPTION",
          details: `Subscribed to plan: ${plan.name} (${billingCycle}), Amount: $${amount}, Method: ${paymentMethod}`,
        },
      });

      return { subscription, payment, invoice };
    });

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Checkout API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
