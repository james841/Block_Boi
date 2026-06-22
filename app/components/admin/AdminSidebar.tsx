"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ADMIN_NAV, type NavGroup } from "@/lib/admin-nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function GroupItem({ group, pathname }: { group: NavGroup; pathname: string }) {
  const containsActive = group.items.some((i) => isActive(pathname, i.href));
  const [open, setOpen] = useState(containsActive);
  const Icon = group.icon;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          containsActive
            ? "text-orange-500 bg-orange-500/5 font-semibold"
            : "text-stone-400 hover:bg-stone-900 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className={`h-[18px] w-[18px] transition-colors ${containsActive ? "text-orange-500" : "text-stone-400 group-hover:text-white"}`} strokeWidth={2} />
          {group.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${open ? "rotate-180 text-orange-500" : ""}`}
        />
      </button>
      {open && (
        <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-stone-800 pl-4.5 transition-all">
          {group.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative rounded-lg px-2.5 py-2 text-sm transition-all duration-150 ${
                  active
                    ? "font-semibold text-orange-500 bg-orange-500/5 before:absolute before:left-[-19px] before:top-1/2 before:-translate-y-1/2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-orange-500"
                    : "text-stone-400 hover:text-white hover:bg-stone-900/40"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-stone-900 bg-stone-950 text-white shadow-[1px_0_10px_rgba(0,0,0,0.3)]">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-stone-900 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 text-sm font-bold text-stone-950 shadow-sm shadow-orange-950/20">
          B
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight leading-none">Bloq Boy</p>
          <p className="text-[10px] font-medium tracking-wider text-stone-400 uppercase leading-none mt-1.5">Admin Console</p>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6 scrollbar-none">
        {ADMIN_NAV.map((item) => {
          if (item.type === "group") {
            return <GroupItem key={item.label} group={item} pathname={pathname} />;
          }
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-orange-500 text-stone-950 font-bold shadow-sm shadow-orange-500/20"
                  : "text-stone-400 hover:bg-stone-900 hover:text-white"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-stone-950" : "text-stone-400"}`} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}