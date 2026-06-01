"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, FileText, Shield, Activity, Upload, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* We do NOT animate this intentionally for instant feedback on keyboard shortcuts */}
        <Command
          className="w-full max-w-xl overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl"
          shouldFilter={true}
        >
          <div className="flex items-center border-b border-white/10 px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-white/50" />
            <Command.Input
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/50"
              placeholder="Type a command or search..."
              autoFocus
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-white/50">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40">
              <Command.Item
                onSelect={() => { router.push("/dashboard"); setOpen(false); }}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Activity className="mr-2 h-4 w-4" />
                Overview
              </Command.Item>
              <Command.Item
                onSelect={() => { router.push("/content"); setOpen(false); }}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Shield className="mr-2 h-4 w-4" />
                Protected Content
              </Command.Item>
              <Command.Item
                onSelect={() => { router.push("/content/upload"); setOpen(false); }}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Asset
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-1 h-px bg-white/10" />

            <Command.Group heading="Settings" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-white/40">
              <Command.Item
                onSelect={() => { router.push("/settings"); setOpen(false); }}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Command.Item>
              <Command.Item
                onSelect={() => { setOpen(false); }}
                className="flex cursor-pointer items-center rounded-md px-2 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white aria-selected:bg-white/10 aria-selected:text-white"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
