"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Layers,
} from "lucide-react";

import Image from "next/image";

// TikTok SVG icon (works even if lucide doesn't have it yet)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.66 6.5c-1.33-1.3-1.96-3.16-1.71-5h-3.41v11.22c0 1.48-1.2 2.68-2.68 2.68-1.48 0-2.68-1.2-2.68-2.68 0-1.48 1.2-2.68 2.68-2.68.36 0 .7.07 1.02.2V7.18c-3.4-.3-6.28 2.28-6.76 5.54-.5 3.34 1.54 6.36 4.46 7.36 2.92 1 6.16-.36 7.44-3.16.78-1.7 1.04-3.64.76-5.48.92.54 2 .86 3.18.86v-3.3c-.82 0-1.58-.28-2.18-.8z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 px-6 md:px-20 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1523]/80 to-[#1c2230]/80 opacity-50" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        
        {/* Brand */}
        <div className="space-y-1 ">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Block Boi Logo" width={100} height={100} className="text-cyan-400 animate-pulse-slow" />
            <h2 className="text-2xl font-bold">Block Boi</h2>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">
            Stylish fashion for the modern individual.
          </p>
        </div>

        {/* Contact */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-cyan-400">Contact Us</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-300 hover:text-cyan-300 transition">
              <MapPin className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span> address: ologunjobi estate, off tosfol events asa dam road Kwara state Nigeria </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 hover:text-cyan-300 transition">
              <Phone className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <span> +234 902 108 0632</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              <a
                href="mailto:thblockboi@gmail.com"
                className="text-gray-300 hover:text-cyan-300 hover:underline transition"
              >
                thblockboi@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-4">
          <div className="space-y-3">
            <Link href="/about" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              About Us
            </Link>
            <Link href="/jobs" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Careers
            </Link>
            <Link href="/press" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Press
            </Link>
            <Link href="/blog" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Blog
            </Link>
          </div>
          <div className="space-y-3">
            <Link href="/contact" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Contact
            </Link>
            <Link href="/terms" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Terms
            </Link>
            <Link href="/privacy" className="block text-gray-300 hover:text-cyan-400 text-sm transition">
              Privacy
            </Link>
          </div>
        </div>

        {/* Social Media – NOW 100% WORKING */}
        <div className="flex items-start justify-start md:justify-end">
          <div className="flex gap-4">
            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@blocboi_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="group p-3 rounded-full border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
            >
              <TikTokIcon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition" />
            </a>

            {/* Twitter */}
            <a
              href="https://x.com/thblockboii?s=21"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="group p-3 rounded-full border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
            >
              <Twitter className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition" />
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/__block.boi?igsh=bDJ1cHJyamk3c3hx&utm_source=qr_code"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="group p-3 rounded-full border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
            >
              <Instagram className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition" />
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/blockboi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="group p-3 rounded-full border border-gray-700 bg-black/40 backdrop-blur-sm hover:border-cyan-400 hover:bg-cyan-400/10 transition-all duration-300 hover:scale-110"
            >
              <Facebook className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Block Boi. All rights reserved.
      </div>
    </footer>
  );
}

// Pulse animation
const styles = `
  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  .animate-pulse-slow {
    animation: pulse-slow 4s infinite ease-in-out;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}