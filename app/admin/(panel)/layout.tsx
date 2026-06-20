"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminAuthProvider } from "@/app/components/admin/AdminAuthContext";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import AdminTopbar from "@/app/components/admin/AdminTopbar";


// Minimal AdminInfo type to satisfy TypeScript when no shared types are available here.
interface AdminInfo {
  id: string;
  name: string;
  username: string; // required by AdminAuthContext.AdminInfo
  email?: string;
  role?: string;
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (cancelled) return;

        if (!data.success) {
          router.replace("/admin/login");
          return;
        }
        setAdmin(data.admin);
      } catch {
        if (!cancelled) router.replace("/admin/login");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Runs exactly once per admin session, not on every page change —
    // this is the whole point of putting it in the layout instead of each page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminAuthProvider admin={admin}>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="pl-64">
          <AdminTopbar />
          <main className="mx-auto max-w-[1600px] p-6">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
