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
    // Applied font-sans or poppins globally across the layout bar
    <nav className="bg-[#FAF6F3] border-b border-black/10 w-full z-50 fixed top-0 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ROW 1: ENHANCED LOGO, SEARCH, UTILITIES */}
        <div className="flex justify-between items-center py-5 gap-8">
          
          {/* Logo Section - Significantly enlarged to mimic the structural weight of reference image */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logoss.png"
                alt="Block Boi Logo"
                // Boosted height dimensions across all responsive break points
                className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
              />
              <span className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase sm:block hidden">
                block boi
              </span>
            </Link>
          </div>

          {/* Centered Expanded Search Bar (Desktop) */}
          <div className="hidden md:block flex-1 max-w-xl mx-auto w-full">
            <SearchBar />
          </div>

          {/* Utility Icons - Scaled up for precise click regions */}
          <div className="hidden md:flex items-center space-x-5 flex-shrink-0 scale-105">
            <CurrencySelector />
            <div className="h-5 w-[1px] bg-black/20" />
            <CartIconButton />
            <UserProfileDropdown />
          </div>

          {/* Mobile Action Hub */}
          <div className="md:hidden flex items-center space-x-3">
            <CurrencySelector />
            <CartIconButton />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black p-2 hover:bg-black/5 transition-all"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* ROW 2: NAV LINKS WITH HIGH-LEGIBILITY WORDING */}
        <div className="hidden md:flex justify-center items-center border-t border-black/5 py-3">
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  // Increased font scale from text-[11px] to text-sm and tracking adjustment for high-contrast reading
                  className={`flex items-center text-xs sm:text-sm font-extrabold tracking-[0.15em] px-6 py-2 uppercase transition-all duration-200 ${
                    activeDropdown === link.name ? "text-[#c64171]" : "text-black/90 hover:text-black"
                  }`}
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown className="ml-1.5 w-4 h-4 opacity-70" />
                  )}
                </Link>

                {/* Dropdown Options */}
                {link.hasDropdown && activeDropdown === link.name && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-60 pt-2 z-50">
                    <div className="bg-white border border-black/10 shadow-xl overflow-hidden rounded-none">
                      {link.subLinks?.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          // Upgraded font rendering inside dropdown popovers
                          className="block px-6 py-3.5 text-xs font-bold tracking-wider text-black hover:bg-black hover:text-white transition-all uppercase border-b border-black/5 last:border-b-0"
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

      {/* MOBILE EXPANDED SEARCH INPUT LAYER */}
      <div className="block md:hidden px-4 pb-4 pt-1 border-t border-black/5">
        <SearchBar />
      </div>

      {/* Mobile Sidebar Frame updates */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-black shadow-2xl z-50 transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center px-6 py-6 border-b border-black bg-black">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logoss.png" alt="Block Boi Logo" className="h-12 w-auto invert brightness-0" />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
            <X size={24} />
          </button>
        </div>
        <div className="px-0 pt-6 flex flex-col h-full font-poppins">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <div key={link.name} className="border-b border-black/5">
                {link.hasDropdown ? (
                  <div className="space-y-0">
                    <Link href={link.href} className="w-full flex items-center justify-between px-8 py-5 text-sm font-extrabold tracking-widest text-black uppercase" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center gap-4"><Icon size={20} /><span>{link.name}</span></div>
                    </Link>
                    <button className="w-full flex items-center justify-between px-8 py-3.5 text-[10px] font-bold text-black/50 bg-gray-50 uppercase tracking-widest" onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}>
                      <span>Browse Categories</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="bg-white">
                        {link.subLinks?.map((subLink) => (
                          <Link key={subLink.name} href={subLink.href} className="block px-12 py-3.5 text-xs font-semibold text-black border-b border-black/5 uppercase tracking-wider hover:bg-black hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={link.href} className="flex items-center gap-4 px-8 py-5 text-sm font-extrabold tracking-widest text-black uppercase hover:bg-black hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
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