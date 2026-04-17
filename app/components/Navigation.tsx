"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, ShoppingBag, Home, Phone } from "lucide-react";
import Link from "next/link";
import CartIconButton from "./cartIconButton";
import UserProfileDropdown from "./userprofiledropdown";
import CurrencySelector from "./CurrencySelector";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks = [
    { name: "HOME", href: "/", icon: Home },
    {
      name: "SHOP",
      href: "/Cloths",
      icon: ShoppingBag,
      hasDropdown: true,
      subLinks: [
        { name: "Shirt", href: "/category/shirt" },
        { name: "Shoes", href: "/category/shoe" },
        { name: "Hats", href: "/category/Hats" },
        { name: "Jackets", href: "/category/Jackets" },
        { name: "Pants", href: "/category/Pants" },
      ],
    },
    { name: "CONTACT", href: "/contactUs", icon: Phone },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-black w-full z-50 fixed top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center -ml-4 -mt-8 -mb-8">
              <img
                src="/logoss.png"
                alt="Block Boi Logo"
                className="h-20 w-auto object-contain sm:h-24 md:h-28 lg:h-32 transition-transform duration-300 hover:scale-105"
              />
            </Link>
            <span className="-ml-6 text-2xl font-black text-black hidden sm:block tracking-tighter uppercase">
              block boi
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative group"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={`flex items-center text-[11px] font-black tracking-[0.2em] px-5 py-3 rounded-none transition-all duration-300 ${
                    activeDropdown === link.name ? "bg-black text-white" : "text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown className={`ml-2 w-4 h-4 transition-transform duration-300 ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                  )}
                </Link>

                {/* Dropdown */}
                {link.hasDropdown && (
                  <div className={`absolute left-0 w-64 pt-0 transition-all duration-300 ${activeDropdown === link.name ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2 pointer-events-none"}`}>
                    <div className="bg-white shadow-xl border border-black mt-0 overflow-hidden">
                      <div className="py-0">
                        {link.subLinks?.map((subLink, index) => (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={`block px-6 py-4 text-[10px] font-black tracking-widest text-black hover:bg-black hover:text-white transition-all border-black ${
                              index !== link.subLinks!.length - 1 ? "border-b" : ""
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="flex items-center justify-between uppercase">
                              <span>{subLink.name}</span>
                              <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Utility Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <CurrencySelector />
            <div className="h-6 w-[1px] bg-black/10" />
            <CartIconButton />
            <UserProfileDropdown />
          </div>

          {/* Mobile UI Buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <CurrencySelector />
            <CartIconButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black p-2 border border-black hover:bg-black hover:text-white transition-all"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-black shadow-2xl z-50 transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Mobile Header */}
        <div className="flex justify-between items-center px-6 py-8 border-b border-black bg-black">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logoss.png" alt="Block Boi Logo" className="h-14 w-auto invert brightness-0" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 border border-white/20 text-white">
            <X size={24} />
          </button>
        </div>

        {/* Mobile Menu Items */}
        <div className="px-0 pt-4 pb-4 flex flex-col h-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.name} className="border-b border-black/5">
                {link.hasDropdown ? (
                  <div className="space-y-0">
                    <Link
                      href={link.href}
                      className="w-full flex items-center justify-between px-8 py-6 text-xs font-black tracking-[0.3em] text-black uppercase"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <Icon size={18} strokeWidth={2.5} />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                    <button
                      className="w-full flex items-center justify-between px-8 py-4 text-[9px] font-black text-black/40 bg-gray-50 uppercase tracking-widest"
                      onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    >
                      <span>Browse Categories</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="bg-white">
                        {link.subLinks?.map((subLink) => (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className="block px-12 py-4 text-[10px] font-bold text-black border-b border-black/5 uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="flex items-center gap-4 px-8 py-6 text-xs font-black tracking-[0.3em] text-black uppercase hover:bg-black hover:text-white transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={18} strokeWidth={2.5} />
                    <span>{link.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
          
          <div className="mt-auto p-8 bg-black text-white">
            <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Block Boi Collective</p>
            <p className="text-[9px] font-bold mt-2 uppercase tracking-widest">Premium Essentials</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Small helper for the dropdown arrow
function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} height={size} viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}