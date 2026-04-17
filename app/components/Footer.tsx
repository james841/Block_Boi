"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";

// TikTok SVG icon - Updated to match monochrome style
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
    <footer className="bg-black text-white py-24 px-6 md:px-16 lg:px-24 border-t border-white/5 relative overflow-hidden">
      
      {/* Structural Logo Watermark */}
      <div className="absolute -bottom-10 -right-10 text-[20vw] font-black text-white/[0.02] leading-none select-none pointer-events-none">
        BLOCK
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
        
        {/* 1. Brand Section */}
        <div className="space-y-8">
          <div className="flex flex-col gap-6">
            <Image 
              src="/logoss.png" 
              alt="Block Boi Logo" 
              width={120} 
              height={120} 
              className="brightness-0 invert w-24 h-auto" 
            />
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Block Boi</h2>
          </div>
          <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] leading-loose max-w-xs">
            Curating essentials for the modern individual through architectural design and premium construction.
          </p>
        </div>

        {/* 2. Contact Section */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Connect</h3>
          <div className="space-y-6 text-[11px] font-bold uppercase tracking-widest">
            <div className="flex items-start gap-4 text-white/60 hover:text-white transition-colors group">
              <MapPin className="w-4 h-4 text-white shrink-0" strokeWidth={1.5} />
              <span className="leading-relaxed">Ologunjobi Estate, Off Tosfol Road, Kwara, NG</span>
            </div>
            <div className="flex items-center gap-4 text-white/60 hover:text-white transition-colors">
              <Phone className="w-4 h-4 text-white shrink-0" strokeWidth={1.5} />
              <span>+234 902 108 0632</span>
            </div>
            <div className="flex items-center gap-4 text-white/60 hover:text-white transition-colors">
              <Mail className="w-4 h-4 text-white shrink-0" strokeWidth={1.5} />
              <a href="mailto:thblockboi@gmail.com" className="hover:underline underline-offset-4 decoration-1">
                thblockboi@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* 3. Navigation Links */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Information</h3>
          <div className="grid grid-cols-1 gap-4">
            {["About Us", "Careers", "Blog", "Terms", "Privacy"].map((link) => (
              <Link 
                key={link} 
                href={`/${link.toLowerCase().replace(" ", "")}`} 
                className="text-[11px] font-black uppercase tracking-widest text-white/50 hover:text-white flex items-center gap-2 transition-all group"
              >
                <span>{link}</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Social Grid */}
        <div className="space-y-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Socials</h3>
          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            {[
              { icon: TikTokIcon, href: "https://www.tiktok.com/@blocboi_", label: "TikTok" },
              { icon: Twitter, href: "https://x.com/thblockboii", label: "Twitter" },
              { icon: Instagram, href: "https://www.instagram.com/__block.boi", label: "Instagram" },
              { icon: Facebook, href: "https://facebook.com/blockboi", label: "Facebook" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-black flex items-center justify-center p-6 hover:bg-white hover:text-black transition-all duration-300 group"
              >
                <social.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          © {new Date().getFullYear()} Block Boi Collective.
        </p>
        <div className="flex gap-8">
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Designed in Nigeria</span>
           <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}