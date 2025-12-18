"use client";

import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import CartIconButton from "./cartIconButton";
import { ModeToggle } from "./ModeToggle";
import UserProfileDropdown from "./userprofiledropdown";
import  CurrencySelector  from "./CurrencySelector";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks = [
    { name: "HOME", href: "/" },
    {
      name: "SHOP",
      href: "/Cloths",
      hasDropdown: true,
      subLinks: [
        { name: "Shirt", href: "/category/shirt" },
        { name: "Shoes", href: "/category/shoe" },
        { name: "Shorts", href: "/category/shorts" },
      ],
    },
    { name: "CONTACT", href: "/contactUs" },
  ];

  return (
    <nav className="bg-amber-100 shadow-md border-b border-amber-200 w-full z-50 fixed top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center -ml-4 -mt-8 -mb-8">
              <img
                src="/logoss.png"
                alt="Block Boi Logo"
                className="h-20 w-auto object-contain drop-shadow-lg 
                         sm:h-24 md:h-28 lg:h-32 
                         transition-all duration-300 hover:scale-105"
              />
            </Link>
            <span className="-ml-6 text-2xl font-extrabold text-gray-800 hidden sm:block">
              block boi
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                {/* Main Link */}
                <Link
                  href={link.href}
                  className="flex items-center text-lg font-semibold text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-100 transition-all"
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown
                      className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                        activeDropdown === link.name ? "rotate-180 text-orange-600" : "text-gray-500"
                      }`}
                    />
                  )}
                </Link>

                {/* Dropdown - FIXED: No gap, always interactive when open */}
                {link.hasDropdown && (
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 w-60 bg-white shadow-2xl rounded-xl border border-orange-200 overflow-hidden transition-all duration-300 ease-out ${
                      activeDropdown === link.name
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                    style={{ pointerEvents: activeDropdown === link.name ? "auto" : "none" }}
                    // This invisible bridge prevents hover gap
                    onMouseEnter={() => setActiveDropdown(link.name)}
                  >
                    {/* Invisible top padding to bridge the gap */}
                    <div className="h-2 -mt-2" />

                    <div className="py-3">
                      {link.subLinks?.map((subLink) => (
                        <Link
                          key={subLink.name}
                          href={subLink.href}
                          className="block px-6 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 text-base font-medium transition-all hover:pl-8"
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

          {/* Utility Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <CurrencySelector />
            <CartIconButton />
            <UserProfileDropdown />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <CurrencySelector />
            <CartIconButton />
            <UserProfileDropdown />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-800 hover:text-orange-600 p-2 rounded-full hover:bg-orange-100 transition-all"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - unchanged & working perfectly */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white border-l border-orange-200 shadow-2xl z-50 overflow-y-auto">
          <div className="flex justify-center py-6 border-b border-orange-100">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="/logo.png" alt="Block Boi Logo" className="h-24 w-auto" />
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-orange-100"
          >
            <X size={28} />
          </button>

          <div className="px-5 pt-8 pb-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.hasDropdown ? (
                  <div>
                    <button
                      className="w-full text-left px-4 py-4 text-lg font-semibold flex items-center justify-between rounded-lg hover:bg-orange-50"
                      onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    >
                      {link.name}
                      <ChevronDown className={`w-5 h-5 transition-transform ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                    </button>
                    {activeDropdown === link.name && (
                      <div className="pl-6 space-y-1 mt-1">
                        {link.subLinks?.map((subLink) => (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className="block px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg"
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
                    className="block px-4 py-4 text-lg font-semibold hover:bg-orange-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}