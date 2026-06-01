import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import BillingClient from "./BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sb-session-token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Get active session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
  });

  if (!session || session.expires < new Date()) {
    redirect("/login");
  }

  const userId = session.userId;

  // Retrieve user subscription
  let sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) {
    // Gracefully fallback or create one
    const freePlan = await prisma.plan.findUnique({ where: { name: "FREE" } });
    sub = await prisma.subscription.create({
      data: {
        userId,
        planTier: "FREE",
        planId: freePlan?.id || null,
        status: "ACTIVE",
      },
    });
  }

  // Get counts
  const uploadsCount = await prisma.upload.count({ where: { userId } });
  const monitoringCount = await prisma.monitoringJob.count({ where: { userId } });

  // Get invoices
  const invoicesDb = await prisma.invoice.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Get plans list
  const plansDb = await prisma.plan.findMany();

  // Map plans to display list format
  const plansList = plansDb.map((p) => ({
    name: p.name,
    priceMonthly: p.priceMonthly,
    priceYearly: p.priceYearly,
    uploadLimit: p.uploadLimit,
    monitoringLimit: p.monitoringLimit,
    features: JSON.parse(p.features) as string[],
  }));

  // Format invoices list for JSON serialization
  const invoices = invoicesDb.map((inv) => ({
    id: inv.id,
    amount: inv.amount,
    currency: inv.currency,
    status: inv.status,
    invoiceNumber: inv.invoiceNumber,
    createdAt: inv.createdAt.toISOString(),
  }));

  const serializableSub = {
    planTier: sub.planTier,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
    paypalSubscriptionId: sub.paypalSubscriptionId,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Billing & Subscription</h1>
        <p className="text-sm text-zinc-400">Manage plan subscriptions, usage limits, and transaction billing history.</p>
      </div>

      <BillingClient
        initialSub={serializableSub}
        uploadsCount={uploadsCount}
        monitoringCount={monitoringCount}
        invoices={invoices}
        plansList={plansList}
      />
    </div>
  );
}
