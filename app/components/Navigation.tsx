"use client";

import { useState } from "react";
import { Menu, X, ChevronDown, ShoppingBag, Home, Phone } from "lucide-react";
import Link from "next/link";
import CartIconButton from "./cartIconButton";
import { ModeToggle } from "./ModeToggle";
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
    <nav className="bg-white shadow-lg border-b-4 border-orange-600 w-full z-50 fixed top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center -ml-4 -mt-8 -mb-8">
              <img
                src="/logoss.png"
                alt="Block Boi Logo"
                className="h-20 w-auto object-contain drop-shadow-2xl 
                         sm:h-24 md:h-28 lg:h-32 
                         transition-all duration-300 hover:scale-105"
              />
            </Link>
            <span className="-ml-6 text-2xl font-extrabold text-gray-900 hidden sm:block tracking-tight">
              block boi
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative group"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.name)}
                onMouseLeave={() => link.hasDropdown && setActiveDropdown(null)}
              >
                {/* Main Link */}
                <Link
                  href={link.href}
                  className="flex items-center text-base font-bold text-gray-800 hover:text-white px-5 py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {link.name}
                  {link.hasDropdown && (
                    <ChevronDown
                      className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                        activeDropdown === link.name ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </Link>

                {/* Dropdown - Fixed with proper hover bridge */}
                {link.hasDropdown && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-64 pt-2 transition-all duration-300 ease-out ${
                      activeDropdown === link.name
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    }`}
                  >
                    {/* Invisible bridge to prevent gap */}
                    <div className="h-2 w-full" />
                    
                    {/* Actual dropdown content */}
                    <div className="bg-white shadow-2xl rounded-2xl border-2 border-orange-600 overflow-hidden">
                      <div className="py-2">
                        {link.subLinks?.map((subLink, index) => (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className={`block px-6 py-4 text-gray-800 hover:bg-orange-600 hover:text-white text-base font-semibold transition-all ${
                              index !== link.subLinks!.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{subLink.name}</span>
                              <ChevronDown className="w-4 h-4 -rotate-90" />
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
          <div className="hidden md:flex items-center space-x-3">
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
              className="text-gray-900 hover:text-white hover:bg-orange-600 p-2 rounded-xl transition-all duration-300 shadow-md"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-white border-l-4 border-orange-600 shadow-2xl z-50 overflow-y-auto md:hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-6 border-b-2 border-gray-200 bg-orange-50">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img src="/logoss.png" alt="Block Boi Logo" className="h-16 w-auto" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-orange-200 transition-all"
            >
              <X size={28} className="text-gray-900" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="px-5 pt-6 pb-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <div key={link.name}>
                  {link.hasDropdown ? (
                    <div className="space-y-2">
                      {/* SHOP Link - Now Clickable */}
                      <Link
                        href={link.href}
                        className="w-full flex items-center justify-between px-5 py-4 text-lg font-bold text-gray-900 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6" />
                          <span>{link.name}</span>
                        </div>
                      </Link>

                      {/* Dropdown Toggle Button */}
                      <button
                        className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                        onClick={() =>
                          setActiveDropdown(activeDropdown === link.name ? null : link.name)
                        }
                      >
                        <span>Browse Categories</span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            activeDropdown === link.name ? "rotate-180 text-orange-600" : ""
                          }`}
                        />
                      </button>

                      {/* Subcategories */}
                      {activeDropdown === link.name && (
                        <div className="pl-4 space-y-1 mt-2 border-l-4 border-orange-600 ml-4">
                          {link.subLinks?.map((subLink) => (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              className="block px-4 py-3 text-gray-800 hover:bg-orange-100 hover:text-orange-600 rounded-lg font-medium transition-all"
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
                      className="flex items-center gap-3 px-5 py-4 text-lg font-bold text-gray-900 bg-orange-50 hover:bg-orange-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-6 h-6" />
                      <span>{link.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-orange-50 border-t-2 border-orange-200">
            <p className="text-center text-sm font-semibold text-gray-700">
              Shop with confidence
            </p>
            <p className="text-center text-xs text-gray-500 mt-1">
              Premium quality products
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}