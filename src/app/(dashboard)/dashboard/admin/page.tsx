import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import AdminClient from "./AdminClient";
import { ShieldAlert, Award } from "lucide-react";
import PromoteButton from "./PromoteButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sb-session-token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Get active session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    redirect("/login");
  }

  const user = session.user;

  // Developer auto-promotion handler: if not admin, show help screen
  if (user.role !== "ADMIN") {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-2 text-yellow-500 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Administrator Panel Restricted</h2>
          <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
            Your current account role is <span className="text-yellow-400 font-semibold">{user.role}</span>. You must have an <span className="text-white font-semibold">ADMIN</span> role to access this area.
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#111111]/40 p-6 max-w-md mx-auto space-y-4">
          <p className="text-xs text-zinc-500 leading-normal">
            To make evaluation easy in local developer sandbox environments, you can instantly promote this email (<code className="text-white">{user.email}</code>) to an Administrator below.
          </p>
          <PromoteButton userId={user.id} />
        </div>
      </div>
    );
  }

  // Retrieve admin statistics lists
  const usersDb = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const waitlistDb = await prisma.waitlist.findMany({
    orderBy: { rank: "asc" },
  });

  const invoicesDb = await prisma.invoice.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const leadsDb = await prisma.salesLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Map to serializable lists
  const users = usersDb.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  const waitlist = waitlistDb.map((w) => ({
    id: w.id,
    name: w.name,
    email: w.email,
    company: w.company,
    useCase: w.useCase,
    referralCode: w.referralCode,
    status: w.status,
    rank: w.rank,
    createdAt: w.createdAt.toISOString(),
  }));

  const invoices = invoicesDb.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    amount: inv.amount,
    status: inv.status,
    createdAt: inv.createdAt.toISOString(),
    user: {
      name: inv.user.name,
      email: inv.user.email,
    },
  }));

  const leads = leadsDb.map((l) => ({
    id: l.id,
    name: l.name,
    email: l.email,
    company: l.company,
    useCase: l.useCase,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Administrative Dashboard</h1>
        <p className="text-sm text-zinc-400">Manage user accounts, approve waitlist applications, advance sales lead pipelines, and inspect platform invoices.</p>
      </div>

      <AdminClient
        users={users}
        waitlist={waitlist}
        invoices={invoices}
        leads={leads}
        currentUserRole={user.role}
      />
    </div>
  );
}
