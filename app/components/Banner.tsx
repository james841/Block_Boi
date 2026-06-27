"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Banner() {
  return (
    <section className="py-24 px-6 sm:px-10 md:px-16 lg:px-24 bg-white relative overflow-hidden">
      {/* Structural Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-black/5" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/5" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] text-black">
            Discover <br /> 
            <span className="text-black/20">Signature</span> Style
          </h2>
          <p className="max-w-xs text-xs font-bold uppercase tracking-[0.3em] text-black/40 leading-relaxed">
            Curated collections designed for the modern architectural wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-black/10 border border-black/10">
          
          {/* Collection One: Men */}
          <div className="group bg-white overflow-hidden relative">
            <div className="flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src="/Images/block7.jpeg"
                  alt="Men's Collection"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Text Content */}
              <div className="p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-8 bg-black" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Essential Men</span>
                </div>
                <h3 className="text-4xl font-black text-black uppercase tracking-tighter">
                  Elevate <br /> Your Style
                </h3>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm font-medium">
                  Discover timeless pieces that blend luxury with everyday confidence. Handpicked for the modern wardrobe.
                </p>
                <Link
                  href="/Cloths?category=men"
                  className="inline-flex items-center gap-8 group/btn"
                >
                  <span className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-1 group-hover/btn:pr-6 transition-all duration-300">
                    Explore
                  </span>
                  <ArrowRight className="w-5 h-5 -translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* Collection Two: Women */}
          <div className="group bg-white overflow-hidden relative">
            <div className="flex flex-col">
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <img
                  src="/Images/block8.jpeg"
                  alt="Women's Collection"
                  className="w-full h-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>

              {/* Text Content */}
              <div className="p-10 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="h-[1px] w-8 bg-black" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Timeless Women</span>
                </div>
                <h3 className="text-4xl font-black text-black uppercase tracking-tighter">
                  Timeless <br /> Elegance
                </h3>
                <p className="text-black/60 text-sm leading-relaxed max-w-sm font-medium">
                  Where classic meets contemporary. Explore premium fabrics and designs crafted for a lasting impression.
                </p>
                <Link
                  href="/Cloths?category=women"
                  className="inline-flex items-center gap-8 group/btn"
                >
                  <span className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-black pb-1 group-hover/btn:pr-6 transition-all duration-300">
                    Explore
                  </span>
                  <ArrowRight className="w-5 h-5 -translate-x-4 opacity-0 group-hover/btn:translate-x-0 group-hover/btn:opacity-100 transition-all duration-300" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Background Text Decor */}
      <div className="absolute -bottom-20 -left-10 text-[20vw] font-black text-black/[0.02] select-none pointer-events-none uppercase">
        Style
      </div>
    </section>
  );
}