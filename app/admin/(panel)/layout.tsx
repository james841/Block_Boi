"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminInfo } from "@/app/components/admin/AdminAuthContext";
import { AdminAuthProvider } from "@/app/components/admin/AdminAuthContext";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import AdminTopbar from "@/app/components/admin/AdminTopbar";


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
      <div className="flex min-h-screen items-center justify-center bg-[#F8F3EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C2410C] border-t-transparent" />
      </div>
    );
  }

  return (
    <AdminAuthProvider admin={admin}>
      <div className="min-h-screen bg-[#F8F3EC]">
        <AdminSidebar />
        <div className="pl-64">
          <AdminTopbar />
          <main className="mx-auto max-w-[1600px] p-6">{children}</main>
        </div>
      </div>
    </AdminAuthProvider>
  );
}
