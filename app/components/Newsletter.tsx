"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to your actual newsletter API
    alert("Thank you for subscribing! You'll get 10% off soon.");
    setEmail("");
  };

  return (
    <section className="py-16 px-6 sm:px-8 lg:px-12 bg-gradient-to-br from-amber-50/80 via-stone-50 to-neutral-100">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            {/* Text & Form Section - Appears first on mobile */}
            <div className="p-8 lg:p-12 text-center lg:text-left order-2 lg:order-1 space-y-8">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-amber-700 via-stone-700 to-neutral-800 bg-clip-text text-transparent">
                  Stay Stylish
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Join thousands of trendsetters. Get exclusive drops, style tips, and{" "}
                <span className="font-bold text-amber-700">10% off your first order</span>{" "}
                — delivered straight to your inbox.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto lg:mx-0">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 text-gray-800 bg-stone-100 border border-stone-300 rounded-full focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-amber-600 via-stone-600 to-neutral-700 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Subscribe Now
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>

            {/* Image Section - Appears below text on mobile */}
            <div className="order-1 lg:order-2">
              <div className="relative h-80 lg:h-full overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src="/Images/couples.webp"
                  alt="Stylish couple showcasing modern fashion"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}