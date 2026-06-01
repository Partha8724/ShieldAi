"use client";

import React, { useState } from "react";
import { Users, Mail, Settings, ShieldCheck, Check, X, ShieldAlert, Award, FileText, Activity, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/Toast";

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
};

type WaitlistItem = {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  useCase: string | null;
  referralCode: string;
  status: string;
  rank: number;
  createdAt: string;
};

type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
};

type LeadItem = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  useCase: string | null;
  status: string;
  createdAt: string;
};

type AdminClientProps = {
  users: UserItem[];
  waitlist: WaitlistItem[];
  invoices: InvoiceItem[];
  leads: LeadItem[];
  currentUserRole: string;
};

export default function AdminClient({
  users: initialUsers,
  waitlist: initialWaitlist,
  invoices,
  leads: initialLeads,
  currentUserRole,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<"users" | "waitlist" | "leads" | "billing" | "simulator">("users");
  
  const [users, setUsers] = useState(initialUsers);
  const [waitlist, setWaitlist] = useState(initialWaitlist);
  const [leads, setLeads] = useState(initialLeads);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleApproveWaitlist = async (id: string) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/waitlist/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: "APPROVED" } : w));
        toast("User waitlist approved!", "success");
      } else {
        toast(data.error || "Approval failed", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectWaitlist = async (id: string) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/waitlist/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWaitlist(prev => prev.map(w => w.id === id ? { ...w, status: "REJECTED" } : w));
        toast("User waitlist rejected", "info");
      } else {
        toast(data.error || "Rejection failed", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    setIsProcessing(userId);
    try {
      const res = await fetch("/api/admin/users/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast(`User role updated to ${newRole}!`, "success");
      } else {
        toast(data.error || "Role update failed", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleTriggerSimulatedThreat = async () => {
    setIsProcessing("threat-sim");
    try {
      const res = await fetch("/api/admin/threats/simulate", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast("Simulated threat triggered! Live alert pushed via SSE.", "success");
      } else {
        toast(data.error || "Simulation trigger failed. Register a protected asset first.", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, currentStatus: string) => {
    const statusSequence = ["PENDING", "CONTACTED", "NEGOTIATING", "WON", "LOST"];
    const nextIndex = (statusSequence.indexOf(currentStatus) + 1) % statusSequence.length;
    const newStatus = statusSequence[nextIndex];

    setIsProcessing(leadId);
    try {
      const res = await fetch("/api/admin/leads/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        toast(`Lead status set to ${newStatus}`, "success");
      } else {
        toast(data.error || "Status update failed", "error");
      }
    } catch {
      toast("Connection error", "error");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Menu Header */}
      <div className="flex border-b border-white/5 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 relative transition-colors ${activeTab === "users" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          Users List ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("waitlist")}
          className={`pb-3 relative transition-colors ${activeTab === "waitlist" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "waitlist" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          Waitlist Queue ({waitlist.length})
        </button>
        <button
          onClick={() => setActiveTab("leads")}
          className={`pb-3 relative transition-colors ${activeTab === "leads" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "leads" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          Sales Leads CRM ({leads.length})
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`pb-3 relative transition-colors ${activeTab === "billing" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "billing" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          Billing History ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab("simulator")}
          className={`pb-3 relative transition-colors ${activeTab === "simulator" ? "text-white" : "text-zinc-500 hover:text-white"}`}
        >
          {activeTab === "simulator" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          Threats Simulator
        </button>
      </div>

      {/* Tabs panels */}
      <div className="bg-[#111111]/40 border border-white/5 rounded-2xl overflow-hidden">
        
        {/* Users list tab */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User Details</th>
                  <th className="px-5 py-3.5">Registered Date</th>
                  <th className="px-5 py-3.5">System Role</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.01]">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white">{u.name || "N/A"}</p>
                        <p className="text-zinc-500 text-[10px]">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${u.role === "ADMIN" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-white/5 text-zinc-300 border border-white/10"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleUpdateRole(u.id, u.role)}
                        disabled={isProcessing === u.id}
                        className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 px-2.5 py-1 rounded transition-colors"
                      >
                        Toggle Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Waitlist tab */}
        {activeTab === "waitlist" && (
          <div className="overflow-x-auto">
            {waitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">Waitlist is empty.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Company & Use Case</th>
                    <th className="px-5 py-3.5">Referral Code</th>
                    <th className="px-5 py-3.5">Queue Rank</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {waitlist.map((w) => (
                    <tr key={w.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-white">{w.name || "N/A"}</p>
                          <p className="text-zinc-500 text-[10px]">{w.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-zinc-300">{w.company || "N/A"}</p>
                          <p className="text-zinc-500 text-[10px]">{w.useCase || "N/A"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400 font-mono">{w.referralCode}</td>
                      <td className="px-5 py-4 text-white font-bold font-mono">#{w.rank}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${w.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400" : w.status === "REJECTED" ? "bg-rose-500/10 text-rose-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        {w.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApproveWaitlist(w.id)}
                              disabled={isProcessing !== null}
                              className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRejectWaitlist(w.id)}
                              disabled={isProcessing !== null}
                              className="p-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black rounded transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CRM Leads tab */}
        {activeTab === "leads" && (
          <div className="overflow-x-auto">
            {leads.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No sales leads captured yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Lead Contact</th>
                    <th className="px-5 py-3.5">Company & Scale</th>
                    <th className="px-5 py-3.5">Created Date</th>
                    <th className="px-5 py-3.5">CRM Pipeline Status</th>
                    <th className="px-5 py-3.5 text-right">Advance Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leads.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-white">{l.name}</p>
                          <p className="text-zinc-500 text-[10px]">{l.email}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-zinc-300">{l.company || "N/A"}</p>
                          <p className="text-zinc-500 text-[10px]">{l.useCase || "N/A"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{new Date(l.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${l.status === "WON" ? "bg-emerald-500/10 text-emerald-400" : l.status === "LOST" ? "bg-rose-500/10 text-rose-400" : "bg-blue-500/10 text-blue-400"}`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleUpdateLeadStatus(l.id, l.status)}
                          disabled={isProcessing === l.id}
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 px-2 py-1 rounded transition-colors"
                        >
                          Cycle Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Billing tab */}
        {activeTab === "billing" && (
          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">No invoices generated yet.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/10 text-zinc-400 font-medium uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Invoice Number</th>
                    <th className="px-5 py-3.5">User Account</th>
                    <th className="px-5 py-3.5">Issue Date</th>
                    <th className="px-5 py-3.5">Paid Amount</th>
                    <th className="px-5 py-3.5 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/[0.01]">
                      <td className="px-5 py-4 font-semibold text-white">{inv.invoiceNumber}</td>
                      <td className="px-5 py-4 text-zinc-300">
                        {inv.user.name || "Member"} &bull; {inv.user.email}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-white">${inv.amount.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right">
                        <a
                          href={`/api/invoices/${inv.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex p-1.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-md transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Simulator tab */}
        {activeTab === "simulator" && (
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">SSE Live Alert Simulator</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Trigger simulated threats on the database to check if your real-time notification stream dispatches alerts correctly.
              </p>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-400 leading-normal">
                Clicking the button below will select the user&apos;s latest protected content footprint, generate a threat report, write it to the sqlite threat tables, and emit an SSE billing/threat payload. Make sure you have uploaded at least one asset first.
              </p>
            </div>

            <button
              onClick={handleTriggerSimulatedThreat}
              disabled={isProcessing !== null}
              className="py-3 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing === "threat-sim" ? <Activity className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              Trigger Threat Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
