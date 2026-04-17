'use client';

import ProductList from "@/Product UI/ProductList";
import { ShoppingBag, ArrowRight, Shield, Activity, Layers } from "lucide-react";
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
      {/* 1. MINIMALIST HERO HEADER */}
      <section className="relative pt-32 pb-20 px-6 md:px-10 border-b border-black/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-10 h-[1px] bg-black"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">
                  Category Archive / {category}
                </span>
              </div>
              
              <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] text-black">
                {title}<span className="text-black/10">.</span>
              </h1>
              
              <p className="text-sm md:text-base font-bold text-black/60 uppercase tracking-widest leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Architectural Feature Box */}
            <div className="hidden lg:block border-l border-black/10 pl-10 py-2">
              <div className="space-y-6">
                <FeatureItem icon={Layers} text="Premium Construction" />
                <FeatureItem icon={Activity} text="Seasonality: Permanent" />
                <FeatureItem icon={Shield} text="Authenticity Verified" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURAL STATS BAR */}
      <section className="bg-black text-white py-12 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem number="500+" label="Pieces in Collection" />
            <StatItem number="2026" label="Current Season" />
            <StatItem number="HQ" label="Quality Controlled" />
            <StatItem number="24/7" label="Support Access" />
          </div>
        </div>
      </section>

      {/* 3. PRODUCT FEED */}
      <section className="py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30">Available Catalogue</h2>
             <div className="h-[1px] flex-1 mx-10 bg-black/5"></div>
          </div>
          <ProductList category={category} />
        </div>
      </section>

      {/* 4. CALL TO ACTION / NAVIGATION */}
      <section className="py-32 px-6 border-t border-black/5 bg-gray-50/50">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-6">
                Missing a <br /> <span className="italic text-black/20">Specific piece?</span>
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-black/50 mb-8 max-w-md">
                Our support team acts as personal curators. Reach out for sizing assistance or specific item requests.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link href="/contactUs" className="text-[10px] font-black uppercase tracking-[0.3em] bg-black text-white px-8 py-4 hover:bg-black/80 transition-all">
                  Contact Support
                </Link>
                <Link href="/Cloths" className="text-[10px] font-black uppercase tracking-[0.3em] border border-black px-8 py-4 hover:bg-black hover:text-white transition-all">
                  Full Catalogue
                </Link>
              </div>
            </div>
            
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984908747-50f98ebb1f41?q=80&w=2070')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-1000" />
               <ShoppingBag className="relative text-white w-12 h-12" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Minimal Feature Component
function FeatureItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2 border border-black/5 group-hover:border-black/20 transition-colors">
        <Icon className="w-4 h-4 text-black" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">{text}</span>
    </div>
  );
}

// Minimal Stat Component
function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-black tracking-tighter uppercase">{number}</div>
      <div className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">{label}</div>
    </div>
  );
}