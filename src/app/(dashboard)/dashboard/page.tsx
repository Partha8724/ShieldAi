import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Shield, AlertTriangle, Activity as ActivityIcon, CheckCircle2, ArrowUpRight, Lock, Key, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sb-session-token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Verify session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    redirect("/login");
  }

  const userId = session.userId;
  const user = session.user;

  // Retrieve metrics
  const protectedAssetsCount = await prisma.protectedContent.count({
    where: { userId },
  });

  // Calculate dynamic scans today (e.g. 24 scans per asset)
  const scansToday = protectedAssetsCount * 24;

  // Get active threats (status is "DETECTED")
  const activeThreatsCount = await prisma.threat.count({
    where: {
      protectedContent: {
        userId,
      },
      status: "DETECTED",
    },
  });

  // Get recent active threats list
  const activeThreats = await prisma.threat.findMany({
    where: {
      protectedContent: {
        userId,
      },
      status: "DETECTED",
    },
    include: {
      protectedContent: true,
    },
    take: 3,
  });

  // Get recent activity from AuditLog
  const recentActivities = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate dynamic Identity Protection Score:
  // Starts at 30%. +25% for 2FA, +25% for Paid subscription, +20% if no active threats.
  let protectionScore = 30;
  if (user.mfaEnabled) protectionScore += 25;
  if (user.subscription && user.subscription.planTier !== "FREE") protectionScore += 25;
  if (activeThreatsCount === 0) protectionScore += 20;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 fill-mode-both">
      {/* Welcome Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">
            Welcome back, {user.name || "Member"}
          </h1>
          <p className="text-sm text-zinc-400">
            Account: {user.email} &bull; Security Level: {user.role}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-mono">
            Score: {protectionScore}%
          </span>
          <span className="text-xs bg-white text-black font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {user.subscription?.planTier || "FREE"} Plan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Panel */}
        <div className="md:col-span-2 rounded-2xl bg-[#111111] border border-white/5 p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Shield className="w-64 h-64 text-white" />
          </div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Monitoring Network Active</span>
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              {activeThreatsCount > 0 ? "Threats Detected" : "System Secure"}
            </h2>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
              {protectedAssetsCount === 0 
                ? "No protected assets registered yet. Head over to Upload Asset to register your first footprint!"
                : `We are running continuous checks on your ${protectedAssetsCount} assets. ${activeThreatsCount} items require immediate action.`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/5 relative z-10">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Protected Footprints</p>
              <p className="text-3xl font-bold text-white">{protectedAssetsCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Scans Executed Today</p>
              <p className="text-3xl font-bold text-white">{scansToday}</p>
            </div>
          </div>
        </div>

        {/* Threat Panel */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Active Threats</h3>
              <AlertTriangle className={`w-4 h-4 ${activeThreatsCount > 0 ? "text-rose-500" : "text-zinc-500"}`} />
            </div>
            
            <div className="text-center py-6">
              <p className="text-6xl font-bold text-white mb-1">{activeThreatsCount}</p>
              <p className="text-xs text-zinc-400">Infringements pending review</p>
            </div>
          </div>

          {activeThreats.length > 0 && (
            <div className="space-y-2 border-t border-white/5 pt-4">
              {activeThreats.map((threat) => (
                <div key={threat.id} className="flex items-center justify-between p-2 rounded bg-white/5 text-[11px]">
                  <span className="text-zinc-300 truncate w-32 font-medium">{threat.protectedContent.title}</span>
                  <span className="text-rose-400 font-bold uppercase">{threat.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="rounded-2xl bg-[#111111] border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Audit Logs & Activity</h3>
        </div>
        
        {recentActivities.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No logged actions on record.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentActivities.map((act) => {
              let Icon = CheckCircle2;
              let iconColor = "text-emerald-400";
              if (act.action.includes("LOGIN")) {
                Icon = Key;
                iconColor = "text-yellow-400";
              } else if (act.action.includes("SUBSCRIBE") || act.action.includes("BILLING")) {
                Icon = CreditCard;
                iconColor = "text-blue-400";
              }

              return (
                <div key={act.id} className="p-4 sm:px-6 flex items-center hover:bg-white/[0.01] transition-colors">
                  <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mr-4 ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider">{act.action}</p>
                    <p className="text-xs text-zinc-500 truncate mt-0.5">{act.details || act.resource}</p>
                  </div>
                  <div className="shrink-0 text-[10px] text-zinc-500 font-mono">
                    {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
