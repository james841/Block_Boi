"use client";

import Link from "next/link";

export default function Banner() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFF9F0] relative overflow-hidden">
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-amber-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-blue-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-12 tracking-tight">
          <span className="bg-gradient-to-r from-amber-400 via-teal-400 to-blue-500 bg-clip-text text-transparent">
            Discover Your Signature Style
          </span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Men's Collection */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center">
              {/* Image - Stacks on top on mobile */}
              <div className="w-full md:w-1/2 p-6 md:p-8 order-1 md:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-teal-400/20 rounded-3xl blur-2xl scale-110 -z-10 group-hover:blur-3xl transition-all duration-500"></div>
                  <img
                    src="/Images/block5.png" // Replace with a better image if needed
                    alt="Confident man in modern tailored outfit"
                    className="w-full h-80 md:h-96 object-cover rounded-3xl border-4 border-white/80 shadow-2xl"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full md:w-1/2 p-8 md:p-10 order-2 md:order-1 text-center md:text-left space-y-6">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                  Elevate Your Style
                </h3>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                 Discover timeless pieces that blend luxury with everyday confidence. Handpicked for the modern wardrobe.                </p>
                <Link
                  href="/Cloths?category=men" // Optional: filter link if you have categories
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Shop Men
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Women's Collection */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden hover:shadow-3xl hover:-translate-y-2 transition-all duration-500">
            <div className="flex flex-col md:flex-row items-center">
              {/* Image */}
              <div className="w-full md:w-1/2 p-6 md:p-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 to-teal-400/20 rounded-3xl blur-2xl scale-110 -z-10 group-hover:blur-3xl transition-all duration-500"></div>
                  <img
                    src="/Images/block6.png" // Replace with a better image if needed
                    alt="Elegant woman in contemporary chic outfit"
                    className="w-full h-80 md:h-96 object-cover rounded-3xl border-4 border-white/80 shadow-2xl"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="w-full md:w-1/2 p-8 md:p-10 text-center md:text-left space-y-6">
                <h3 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                Timeless Elegance 
                </h3>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                  Where classic meets contemporary. Explore premium fabrics and designs crafted for lasting impression.
                </p>
                <Link
                  href="/Cloths?category=women" // Optional: filter link
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Shop
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}