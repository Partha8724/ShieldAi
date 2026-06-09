import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
// Stripe integration removed per requirements
import { getCleanSiteUrl } from "@/lib/utils";

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

    if (paymentMethod.toLowerCase() === "stripe") {
      return NextResponse.json({ error: "Card payments are not supported. Please use PayPal or Crypto." }, { status: 400 });
    }

    if (paymentMethod.toLowerCase() === "crypto") {
      const apiKey = process.env.NEWPAYMENT_API_KEY;
      const siteUrl = getCleanSiteUrl(req);

      if (apiKey) {
        try {
          const nowpaymentsUrl = "https://api.nowpayments.io/v1/invoice";
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

          if (res.ok) {
            const invoiceData = await res.json();
            const invoiceId = invoiceData.id;
            const invoiceUrl = invoiceData.invoice_url;

            // Create a pending payment in our database
            await prisma.payment.create({
              data: {
                userId: session.userId,
                amount,
                currency: "USD",
                status: "PENDING",
                paymentMethod: "CRYPTO",
                transactionId: `NEWPAY-${invoiceId}`,
              },
            });

            return NextResponse.json({ success: true, url: invoiceUrl });
          } else {
            const errText = await res.text();
            console.warn("NOWPayments Commerce API error, falling back to simulated direct subscription activation:", errText);
          }
        } catch (error) {
          console.warn("NOWPayments Commerce network error, falling back to simulated direct subscription activation:", error);
        }
      }

      // Fallback for crypto checkout – only active in non‑production environments
      if (process.env.NODE_ENV !== "production") {
        console.log("Crypto checkout fallback triggered. Directly starting active subscription.");
        const mockInvoiceId = `MOCK-NEWPAYMENT-${Date.now()}`;

        // Register payment (COMPLETED) for immediate activation
        await prisma.payment.create({
          data: {
            userId: session.userId,
            amount,
            currency: "USD",
            status: "COMPLETED",
            paymentMethod: "CRYPTO",
            transactionId: mockInvoiceId,
          },
        });

        // Calculate invoice and subscription period
        const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
        const currentPeriodEnd = new Date();
        if (billingCycle === "yearly") {
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        } else {
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        }

        // Create subscription, invoice, notification and audit log in one transaction
        await prisma.$transaction(async (tx) => {
          const subscription = await tx.subscription.upsert({
            where: { userId: session.userId },
            update: { planTier: plan.name, planId: plan.id, status: "ACTIVE", currentPeriodEnd },
            create: { userId: session.userId, planTier: plan.name, planId: plan.id, status: "ACTIVE", currentPeriodEnd },
          });

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

          await tx.notification.create({
            data: {
              userId: session.userId,
              title: "Crypto Subscription Activated",
              message: `Your ShieldAI ${plan.name} plan is active via Crypto payment.`,
              type: "BILLING",
            },
          });

          await tx.auditLog.create({
            data: {
              userId: session.userId,
              action: "SUBSCRIBE_CRYPTO",
              resource: "SUBSCRIPTION",
              details: `Crypto checkout confirmed and activated directly (fallback) for ${plan.name}`,
            },
          });
        });

        // Redirect to success URL in dev mode
        return NextResponse.json({
          success: true,
          url: `${siteUrl}/dashboard?payment=success&crypto_invoice=${mockInvoiceId}`,
        });
      } else {
        // In production, propagate the error so the client can show a proper message
        console.error("NOWPayments API failed – fallback disabled in production");
        return NextResponse.json({ error: "Payment provider unavailable – please try again later" }, { status: 502 });
      }
    }
    if (paymentMethod.toLowerCase() === "paypal") {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const paypalMode = process.env.PAYPAL_MODE || "sandbox";
      const baseUrl = paypalMode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";

      if (clientId && clientSecret) {
        const siteUrl = getCleanSiteUrl(req);

        try {
          // Get access token
          const authRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
          });

          if (!authRes.ok) {
            console.error("PayPal auth failed during checkout:", await authRes.text());
            return NextResponse.json({ error: "PayPal authentication failed" }, { status: 502 });
          }

          const { access_token } = await authRes.json();

          // Create order
          const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              intent: "CAPTURE",
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: String(amount),
                  },
                  description: `ShieldAI ${plan.name} Plan (${billingCycle})`,
                },
              ],
              application_context: {
                brand_name: "ShieldAI",
                return_url: `${siteUrl}/api/payments/paypal/callback?planTier=${plan.name}&billingCycle=${billingCycle}&userId=${session.userId}`,
                cancel_url: `${siteUrl}/pricing`,
              },
            }),
          });

          if (!orderRes.ok) {
            console.error("PayPal create-order failed during checkout:", await orderRes.text());
            return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 });
          }

          const order = await orderRes.json();
          const approveLink = order.links.find((l: any) => l.rel === "approve");
          if (approveLink) {
            return NextResponse.json({ success: true, url: approveLink.href });
          }
        } catch (error) {
          console.error("PayPal checkout setup exception:", error);
          return NextResponse.json({ error: "Failed to set up PayPal checkout" }, { status: 502 });
        }
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
