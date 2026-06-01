import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { FileImage, Shield, Search, Plus, Filter, MoreHorizontal, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ContentLibraryPage() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sb-session-token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Verify active session
  const session = await prisma.session.findUnique({
    where: { sessionToken },
  });

  if (!session || session.expires < new Date()) {
    redirect("/login");
  }

  const userId = session.userId;

  const contents = await prisma.protectedContent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  }).catch(() => []); // Fallback to empty array if DB fails for some reason during dev

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 fill-mode-both">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-white mb-1">Content Library</h1>
          <p className="text-sm text-zinc-400">Manage and monitor your protected digital assets.</p>
        </div>
        <Link
          href="/content/upload"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Asset
        </Link>
      </div>

      {contents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search assets..."
                className="w-full h-9 pl-9 pr-4 text-sm bg-black border border-white/10 rounded-md text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all"
              />
            </div>
            <button className="h-9 px-3 flex items-center justify-center text-sm font-medium text-zinc-300 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>

          <div className="border border-white/10 rounded-xl bg-[#111111] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[650px]">
              <thead className="bg-white/5 border-b border-white/10 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Added</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contents.map((item) => {
                  let meta: any = {};
                  try { meta = JSON.parse(item.description || "{}"); } catch (e) {}

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-black border border-white/10 flex items-center justify-center mr-4 shrink-0">
                            <FileImage className="w-5 h-5 text-zinc-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate max-w-[200px]">{item.title}</p>
                            <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                              {meta.mimeType || "Unknown type"} • {meta.originalSize ? (meta.originalSize / 1024 / 1024).toFixed(2) + " MB" : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "COMPROMISED" ? (
                          <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Threat Detected</span>
                          </div>
                        ) : item.status === "INACTIVE" ? (
                          <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-medium border border-zinc-500/20">
                            <Shield className="w-3 h-3" />
                            <span>Inactive</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center space-x-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                            <Shield className="w-3 h-3" />
                            <span>Protected</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-zinc-400 bg-black px-2 py-1 rounded border border-white/5">
                          {meta.certificateId || "Pending"}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-zinc-400 hover:text-white rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
        <Shield className="w-8 h-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No assets protected yet</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-8 leading-relaxed">
        Upload your first image or document to generate a perceptual hash, embed an invisible watermark, and issue an ownership certificate.
      </p>
      <Link
        href="/content/upload"
        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors shadow-lg shadow-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 ease-custom duration-200"
      >
        <Plus className="w-4 h-4 mr-2" />
        Upload First Asset
      </Link>
    </div>
  );
}
