'use client';

import ProductList from "@/Product UI/ProductList";
import { ShoppingBag, ArrowRight, Shield, Activity, Layers, Menu } from "lucide-react";
import Link from "next/link";

type CategoryPageClientProps = {
  category: string;
  title: string;
  description: string;
};

export default function CategoryPageClient({ 
  category, 
  title, 
  description 
}: CategoryPageClientProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. MOBILE-FIRST HERO */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 px-5 md:px-10 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col gap-6 md:gap-10">
            
            <div className="max-w-3xl space-y-4 md:space-y-6">
              {/* Category Tag */}
              <div className="flex items-center gap-2 md:gap-3">
                <span className="w-8 md:w-10 h-[1px] bg-black"></span>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-black/40">
                  {category} Archive
                </span>
              </div>
              
              {/* Title - Scaled for Mobile screens */}
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.9] md:leading-[0.8] text-black">
                {title}<span className="text-black/10">.</span>
              </h1>
              
              {/* Description - Better line height for small screens */}
              <p className="text-xs md:text-base font-bold text-black/60 uppercase tracking-widest leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Feature Grid - Reorganized for mobile (2 columns) */}
            <div className="grid grid-cols-2 lg:flex lg:flex-col gap-4 md:gap-6 pt-6 border-t border-black/5 lg:border-l lg:border-t-0 lg:pl-10">
              <FeatureItem icon={Layers} text="Premium Build" />
              <FeatureItem icon={Activity} text="Season: 2026" />
              <FeatureItem icon={Shield} text="Verified" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONDENSED STATS BAR */}
      <section className="bg-black text-white py-8 md:py-12 px-5">
        <div className="max-w-[1400px] mx-auto">
          {/* Using a 2x2 grid on mobile to keep it tight */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
            <StatItem number="500+" label="Catalogue" />
            <StatItem number="PERM" label="Seasonality" />
            <StatItem number="HQ" label="Quality" />
            <StatItem number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* 3. PRODUCT FEED - Mobile Spacing Fix */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <div className="flex items-center justify-between mb-8 md:mb-12">
             <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-black/30 whitespace-nowrap">Current Selection</h2>
             <div className="h-[1px] flex-1 ml-6 bg-black/5"></div>
          </div>
          
          {/* Ensure ProductList handles its own mobile grid (usually 1 or 2 cols) */}
          <ProductList category={category} />
        </div>
      </section>

      {/* 4. CALL TO ACTION - Stacked for mobile */}
      <section className="py-20 md:py-32 px-5 border-t border-black/5 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 md:gap-16 items-start lg:items-center">
            <div className="w-full">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                Personal <br /> <span className="italic text-black/20">Curation.</span>
              </h2>
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black/50 mb-8 max-w-sm">
                Reach out for sizing assistance or specific item requests.
              </p>
              
              {/* Full width buttons on mobile for better tap targets */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/contactUs" className="text-[10px] text-center font-black uppercase tracking-[0.3em] bg-black text-white px-8 py-5 hover:bg-black/80 transition-all">
                  Contact Support
                </Link>
                <Link href="/Cloths" className="text-[10px] text-center font-black uppercase tracking-[0.3em] border border-black px-8 py-5 hover:bg-black hover:text-white transition-all">
                  Full Catalogue
                </Link>
              </div>
            </div>
            
            {/* Visual element hidden on tiny screens to save scroll space, or made small */}
            <div className="relative w-full aspect-video bg-black overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984908747-50f98ebb1f41?q=80&w=2070')] bg-cover bg-center opacity-40" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <ShoppingBag className="text-white w-8 h-8 opacity-50" />
               </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1.5 border border-black/5">
        <Icon className="w-3.5 h-3.5 text-black" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-black/60">{text}</span>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-0.5 md:space-y-1">
      <div className="text-xl md:text-2xl font-black tracking-tighter uppercase">{number}</div>
      <div className="text-[8px] md:text-[9px] font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-white/40">{label}</div>
    </div>
  );
}