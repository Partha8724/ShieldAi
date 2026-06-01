"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, Shield, Menu, User, Settings, LogOut, FileText, Upload, CreditCard, Layers, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";

const BackgroundMedia = dynamic(() => import("@/components/BackgroundMedia"), { ssr: false });

const NAV_ITEMS = [
  { name: "Overview", href: "/dashboard", icon: Activity },
  { name: "Protected Content", href: "/content", icon: FileText },
  { name: "Upload Asset", href: "/content/upload", icon: Upload },
  { name: "Interactive Sandbox", href: "/dashboard/sandbox", icon: Layers },
  { name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
  { name: "Admin Panel", href: "/dashboard/admin", icon: Settings },
];

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [bellMenuOpen, setBellMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string | null; email?: string | null; role?: string } | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const pathname = usePathname();
  const supabase = createClient();

  // Handle responsive sidebar states
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      if (res?.data?.user) {
        setCurrentUser(res.data.user);
      }
    });
  }, []);

  // Set up real-time SSE listener for new notifications
  useEffect(() => {
    if (!currentUser) return;

    // Load initial list from backend DB
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.notifications.filter((n: any) => !n.isRead).length);
        }
      })
      .catch((e) => console.error("Failed to load initial notifications", e));

    const sse = new EventSource("/api/notifications/stream");
    
    sse.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data) as NotificationItem;
        setNotifications((prev) => [notif, ...prev].slice(0, 20)); // Limit state to last 20
        setUnreadCount((prev) => prev + 1);
        
        // Show native dashboard toast (red/error for security threats, info for system/billing)
        const variant = (notif.type === "THREAT" || notif.type === "SECURITY") ? "error" : "info";
        toast(`${notif.title}: ${notif.message}`, variant);
      } catch (err) {
        console.error("Failed to parse event data", err);
      }
    };

    sse.onerror = () => {
      console.warn("Notification stream connection broken. Reconnecting...");
    };

    return () => {
      sse.close();
    };
  }, [currentUser]);

  const markAllRead = async () => {
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true } as any)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-zinc-100 overflow-hidden font-sans relative">
      <BackgroundMedia />
      <CommandPalette />

      {/* Backdrop overlay on mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar Layout */}
      <nav 
        className={cn(
          "border-r border-white/10 bg-[#0c0c0c] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          // Mobile fixed overlay
          "fixed inset-y-0 left-0 z-50 w-[260px] h-full -translate-x-full",
          // Desktop grid layout
          "md:relative md:translate-x-0 md:w-auto md:grid",
          sidebarOpen 
            ? "translate-x-0 md:grid-cols-[260px]" 
            : "-translate-x-full md:grid-cols-[0px]"
        )}
      >
        <div className="overflow-hidden flex flex-col h-full">
          <div className="h-16 flex items-center px-6 shrink-0 border-b border-white/5">
            <Shield className="w-5 h-5 text-white mr-3" />
            <span className="font-medium tracking-wide text-sm">ShieldAI</span>
          </div>

          <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              if (item.name === "Admin Panel" && currentUser && currentUser.role !== "ADMIN") {
                return null;
              }

              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors group relative",
                    isActive 
                      ? "text-white bg-white/5" 
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-4 h-4 mr-3 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center ml-4 text-sm text-zinc-500">
              <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-medium mr-3 flex items-center">
                <Search className="w-3 h-3 mr-1.5" />
                <span className="opacity-60">⌘K</span>
              </span>
              <span className="opacity-50">Quick Search</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Real-time Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => { setBellMenuOpen(!bellMenuOpen); setUserMenuOpen(false); if (unreadCount > 0) markAllRead(); }}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-colors relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {bellMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-96"
                  >
                    <div className="p-3 border-b border-white/5 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-zinc-400 hover:text-white transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-72">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-500">
                          No notifications received yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3.5 space-y-1 hover:bg-white/[0.01]">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-white">{notif.title}</p>
                              <span className="text-[9px] text-zinc-500">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setBellMenuOpen(false); }}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center border border-white/10 hover:border-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <User className="w-4 h-4 text-white/80" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                    style={{ transformOrigin: "top right" }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-medium text-white">{currentUser?.name || "Vault Member"}</p>
                      <p className="text-xs text-zinc-500 truncate">{currentUser?.email || "guest@shieldai.com"}</p>
                    </div>
                    <div className="p-1.5">
                      <button 
                        className="flex items-center w-full px-2.5 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await supabase.auth.signOut();
                          window.location.href = "/login";
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
