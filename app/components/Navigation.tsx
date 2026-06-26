"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, ShoppingBag, Home, Phone } from "lucide-react";
import Link from "next/link";
import CartIconButton from "./cartIconButton";
import UserProfileDropdown from "./userprofiledropdown";
import CurrencySelector from "./CurrencySelector";
import SearchBar from "./SearchBar";

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
        { name: "Shorts", href: "/category/shorts" },
        { name: "Hats", href: "/category/Hats" },
        { name: "Jackets", href: "/category/Jackets" },
        { name: "Pants", href: "/category/Pants" },
      ],
    },
    { name: "CONTACT", href: "/contactUs", icon: Phone },
  ];

  return (
    // Solid Chalk White background for a pristine, minimalist luxury store feel
    <nav className="bg-white border-b border-black/[0.08] w-full z-50 fixed top-0 font-poppins transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* ROW 1: MASSIVE LOGO, CRISP SEARCH & SPACIOUS UTILITIES */}
        <div className="flex justify-between items-center py-6 gap-10">
          
          {/* Logo Section - Maximized height & spacing to anchor the visual brand hierarchy */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-4 group">
              <img
                src="/logoss.png"
                alt="Block Boi Logo"
                // Max sizes increased significantly for desktop display rules
                className="h-16 sm:h-20 md:h-24 lg:h-26 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <span className="text-3xl sm:text-4xl font-black text-black tracking-tighter uppercase sm:block hidden">
                block boi
              </span>
            </Link>
          </div>

          {/* Centered Minimalist Search Bar Container */}
          <div className="hidden md:block flex-1 max-w-2xl mx-auto w-full px-4">
            <SearchBar />
          </div>

          {/* Utility Quick-Actions (Scaled, High Contrast) */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0 scale-110">
            <CurrencySelector />
            <div className="h-5 w-[1px] bg-black/10" />
            <CartIconButton />
            <UserProfileDropdown />
          </div>

          {/* Mobile Hub Action Triggers */}
          <div className="md:hidden flex items-center space-x-4">
            <CurrencySelector />
            <CartIconButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black p-2 transition-colors hover:bg-black/[0.03]"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* ROW 2: CENTERED EDITORIAL LINK LINKAGES */}
        <div className="hidden md:flex justify-center items-center border-t border-black/[0.05] py-4">
          <div className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  // High legibility typography using Poppins tracking weights
                  className={`flex items-center text-xs md:text-sm font-black tracking-[0.25em] px-6 py-2 uppercase transition-all duration-300 relative after:absolute after:bottom-0 after:left-6 after:right-6 after:h-[2px] after:bg-[#c64171] after:transform after:scale-x-0 after:origin-center hover:after:scale-x-100 after:transition-transform after:duration-300 ${
                    activeDropdown === link.name ? "text-[#c64171]" : "text-black/80 hover:text-black"
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown className={`ml-1.5 w-4 h-4 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180 text-[#c64171]' : 'opacity-60'}`} />
                  )}
                </Link>

                {/* Dropdown Frame Re-styled */}
                {link.hasDropdown && activeDropdown === link.name && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-64 pt-3 z-50">
                    <div className="bg-white border border-black/[0.08] shadow-2xl overflow-hidden rounded-none">
                      {link.subLinks?.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className="block px-6 py-4 text-xs font-bold tracking-widest text-black hover:bg-black hover:text-white transition-all uppercase border-b border-black/[0.04] last:border-b-0"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MOBILE COMPACT SEARCH TIER */}
      <div className="block md:hidden px-6 pb-5 pt-1 border-t border-black/[0.05]">
        <SearchBar />
      </div>

      {/* Mobile Menu Panel Layout */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-85 bg-white border-l border-black/[0.08] shadow-2xl z-50 transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-8 py-6 border-b border-black/[0.08] bg-white">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logoss.png" alt="Block Boi Logo" className="h-14 w-auto object-contain" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-black">
            <X size={26} />
          </button>
        </div>
        <div className="px-0 pt-6 flex flex-col h-full font-poppins bg-white">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.name} className="border-b border-black/[0.04]">
                {link.hasDropdown ? (
                  <div className="space-y-0">
                    <Link href={link.href} className="w-full flex items-center justify-between px-8 py-5 text-sm font-black tracking-widest text-black uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-4"><Icon size={20} /><span>{link.name}</span></div>
                    </Link>
                    <button className="w-full flex items-center justify-between px-8 py-4 text-[11px] font-bold text-black/40 bg-gray-50 uppercase tracking-widest" onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}>
                      <span>Browse Categories</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="bg-white">
                        {link.subLinks?.map((subLink) => (
                          <Link key={subLink.name} href={subLink.href} className="block px-12 py-4 text-xs font-bold text-black border-b border-black/[0.04] uppercase tracking-wider hover:bg-black hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={link.href} className="flex items-center gap-4 px-8 py-5 text-sm font-black tracking-widest text-black uppercase hover:bg-black hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                    <Icon size={20} /><span>{link.name}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}