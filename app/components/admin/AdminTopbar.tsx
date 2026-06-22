
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import { useAdmin } from "./AdminAuthContext";

function titleFromPath(pathname: string) {
  if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
  if (pathname.startsWith("/admin/products/add")) return "Add Product";
  if (pathname.startsWith("/admin/products/edit")) return "Edit Product";
  if (pathname.startsWith("/admin/products")) return "Products";
  if (pathname.startsWith("/admin/CategoryShowcase")) return "Categories";
  if (pathname.startsWith("/admin/slider")) return "Hero Slider";
  return "Admin";
}

export default function AdminTopbar() {
  const admin = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200/60 bg-white/80 px-6 backdrop-blur-md">
      <h1 className="text-base font-bold text-stone-950 tracking-tight">{titleFromPath(pathname)}</h1>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors duration-150 hover:bg-stone-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-stone-950 uppercase ring-2 ring-orange-500/10">
            {admin.username.slice(0, 2)}
          </div>
          <span className="text-sm font-semibold text-stone-800 tracking-tight">{admin.username}</span>
          <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-100">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors duration-150 hover:bg-rose-50/60"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

