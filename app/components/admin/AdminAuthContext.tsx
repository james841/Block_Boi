"use client";

import { createContext, useContext } from "react";

export type AdminInfo = {
  id?: number | string;
  username: string;
};

const AdminAuthContext = createContext<AdminInfo | null>(null);

export function AdminAuthProvider({
  admin,
  children,
}: {
  admin: AdminInfo;
  children: React.ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={admin}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Use this in any admin page/component instead of re-fetching /api/admin/me
export function useAdmin() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within the admin (panel) layout");
  }
  return ctx;
}
