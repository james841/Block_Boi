"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Welcome to the inner circle. Code: BLOCK10");
    setEmail("");
  };

  return (
    <section className="py-24 px-6 sm:px-10 md:px-16 lg:px-24 bg-white border-t border-black/5">
      <div className="max-w-[1400px] mx-auto">
        {/* THE MAIN CONTAINER - FORCED BLACK */}
        <div className="bg-black overflow-hidden relative border border-black flex flex-col lg:flex-row">
          
          {/* 1. TEXT & FORM SECTION - NOW SOLID BLACK */}
          <div className="w-full lg:w-1/2 p-10 md:p-16 lg:p-20 flex flex-col justify-center space-y-12 bg-black text-white relative z-10">
            
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="h-[1px] w-12 bg-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">The Collective</span>
              </div>
              
              <h2 className="text-6xl md:text-7xl xl:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                Members <br /> 
                <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>Only.</span>
              </h2>
              
              <p className="text-sm font-medium text-white/50 max-w-sm leading-relaxed">
                Join our inner circle for priority access to drops and 
                <span className="text-white font-black italic ml-1 underline underline-offset-8"> 10% OFF </span> 
                your first architectural piece.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-6">
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR@EMAIL.COM"
                  className="w-full px-0 py-6 bg-transparent border-b border-white/20 text-white font-black uppercase tracking-[0.2em] placeholder:text-white/10 focus:outline-none focus:border-white transition-all duration-500"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-6 flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white hidden sm:block">Join Now</span>
                  <ArrowRight className="w-6 h-6 text-white" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                <span>No Spam</span>
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                <span>Exclusive Access</span>
              </div>
            </form>
          </div>

          {/* 2. IMAGE SECTION - FULL COLOR */}
          <div className="w-full lg:w-1/2 h-[450px] lg:h-auto overflow-hidden relative">
            <img
              src="/Images/block9.jpeg"
              alt="Latest Collection"
              className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
            />
            {/* Dark overlay to help the image sit better against the black form */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            
            {/* Branding Badge */}
            <div className="absolute bottom-0 right-0 bg-white text-black px-8 py-5 hidden lg:block">
              <p className="text-[11px] font-black tracking-[0.4em] uppercase">Est. 2026</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}