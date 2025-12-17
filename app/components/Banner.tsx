"use client";

import Link from "next/link";

export default function Banner() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FFF9F0] relative overflow-hidden">
      {/* Subtle animated background glow */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-amber-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-tl from-blue-400/30 to-teal-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-12 tracking-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-amber-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
            Discover Your Style
          </span>
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Male Collection */}
          <div className="group w-full md:w-1/2 bg-white/90 backdrop-blur-xl rounded-3xl p-8 flex items-center justify-between shadow-2xl border border-white/50 hover:scale-[1.02] hover:shadow-3xl transition-all duration-500">
            <div className="max-w-[60%] space-y-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                Where dreams meet couture
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Elevate your wardrobe with bold, timeless pieces crafted for the modern man.
              </p>
              <Link
                href="/Cloths"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-500 text-white px-7 py-3.5 rounded-full font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group-hover:from-amber-600 group-hover:via-teal-600 group-hover:to-blue-600"
              >
                Shop Now
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-teal-400/20 rounded-3xl blur-xl scale-110 -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="/Images/block5.png"
                alt="Male model in stylish outfit"
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-3xl border-4 border-white/80 shadow-xl"
              />
            </div>
          </div>

          {/* Female Collection */}
          <div className="group w-full md:w-1/2 bg-white/90 backdrop-blur-xl rounded-3xl p-8 flex items-center justify-between shadow-2xl border border-white/50 hover:scale-[1.02] hover:shadow-3xl transition-all duration-500">
            <div className="max-w-[60%] space-y-4">
              <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                Enchanting styles for every woman
              </h3>
              <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                Discover elegance and confidence in every stitch — fashion that speaks your soul.
              </p>
              <Link
                href="/Cloths"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-teal-500 to-blue-500 text-white px-7 py-3.5 rounded-full font-bold text-sm md:text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group-hover:from-amber-600 group-hover:via-teal-600 group-hover:to-blue-600"
              >
                Shop Now
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-bl from-blue-400/20 to-teal-400/20 rounded-3xl blur-xl scale-110 -z-10 group-hover:blur-2xl transition-all duration-500"></div>
              <img
                src="/Images/block6.png"
                alt="Female model in stylish outfit"
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-3xl border-4 border-white/80 shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}