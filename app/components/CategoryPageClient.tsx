'use client';

import ProductList from "@/Product UI/ProductList";
import { ShoppingBag, Sparkles, TrendingUp, Shield, Link } from "lucide-react";

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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 py-20 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-semibold mb-6 border border-white/30 shadow-xl">
            <Sparkles className="w-5 h-5" />
            <span>Premium Collection</span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-2xl">
            {title}
          </h1>

          {/* Description */}
          <p className="text-blue-100 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed">
            {description}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4">
            <FeaturePill icon={ShoppingBag} text="Curated Selection" />
            <FeaturePill icon={TrendingUp} text="Latest Trends" />
            <FeaturePill icon={Shield} text="Quality Guaranteed" />
          </div>
        </div>

        {/* Bottom Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              fill="rgb(249 250 251)"
              className="fill-blue-50"
            />
          </svg>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative -mt-16 mb-12 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard 
                number="500+" 
                label="Products Available" 
                color="text-blue-600"
                bgColor="bg-blue-50"
              />
              <StatCard 
                number="24/7" 
                label="Customer Support" 
                color="text-orange-600"
                bgColor="bg-orange-50"
              />
              <StatCard 
                number="100%" 
                label="Quality Assured" 
                color="text-green-600"
                bgColor="bg-green-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 shadow-xl border border-blue-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold">Shop with Confidence</h3>
                <p className="text-blue-100">Free shipping on orders over ₦50,000</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:scale-105">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <ProductList category={category} />

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-16 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          
          <p className="text-orange-100 text-lg mb-8">
            Contact our support team and we'll help you find the perfect product
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contactUs">
              <button className="px-10 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                Contact Support
              </button>
            </a>
          
          <a href="/Cloths">
              <button className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-white/30">
                Browse All Products
              </button>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// Feature Pill Component
function FeaturePill({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full text-white font-semibold border border-white/30 shadow-lg hover:bg-white/30 transition-all">
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  number, 
  label, 
  color,
  bgColor 
}: { 
  number: string; 
  label: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 ${bgColor} rounded-2xl mb-4`}>
        <span className={`text-3xl font-black ${color}`}>
          {number.charAt(0)}
        </span>
      </div>
      <div className={`text-4xl font-black ${color} mb-2`}>
        {number}
      </div>
      <div className="text-gray-600 font-semibold">
        {label}
      </div>
    </div>
  );
}