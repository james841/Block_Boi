"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navigation";
import CartDrawer from "./CartDrawer";
import Footer from "./Footer";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartDrawer />}
     
      {children}
    </>
  );
}