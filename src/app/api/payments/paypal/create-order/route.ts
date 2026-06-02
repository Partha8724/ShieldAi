import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { amount, currency, planTier, billingCycle } = await req.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const paypalMode = process.env.PAYPAL_MODE || "sandbox";
    const baseUrl = paypalMode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // If real PayPal credentials are configured, create a real order
    if (clientId && clientSecret) {
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
        console.error("PayPal auth failed:", await authRes.text());
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
                currency_code: currency || "USD",
                value: String(amount || "19.00"),
              },
              description: `ShieldAI ${planTier || "Creator"} Plan (${billingCycle || "monthly"})`,
            },
          ],
          application_context: {
            brand_name: "ShieldAI",
            return_url: `${new URL(req.url).origin}/dashboard?payment=success`,
            cancel_url: `${new URL(req.url).origin}/pricing`,

          },
        }),
      });

      if (!orderRes.ok) {
        console.error("PayPal create-order failed:", await orderRes.text());
        return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 502 });
      }

      const order = await orderRes.json();
      return NextResponse.json({ id: order.id, status: order.status });
    }

    // Fallback: mock order ID for sandbox/development
    const mockOrderId = `PAYPAL-ORDER-${Date.now()}`;
    return NextResponse.json({ id: mockOrderId });
  } catch (error) {
    console.error("PayPal create-order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
