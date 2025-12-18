"use client";

import { Link } from "lucide-react";
import React from "react";

export default function GetStartedSection() {
  return (
    <section className=" text-white py-20 px-4 flex justify-center relative z-20 -mb-28">
      <div className="bg-[#000000] p-10 rounded-lg text-center max-w-2xl w-full shadow-2xl transform transition-all duration-500 hover:shadow-blue-500/20">
        <h2 className="text-2xl font-bold mb-3 text-cyan-400 animate-fade-in">Get early access today</h2>
        <p className="text-gray-300 mb-6 text-sm leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
          It only takes a minute to sign up and our free starter tier is
          extremely generous. If you have any questions, our support team would
          be happy to help you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <input
            type="email"
            placeholder="email@example.com"
            className="flex-1 px-6 py-3 rounded-full text-white-900 outline-none text-sm border border-gray-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
          />
          <Link>
          <button className="bg-[#3eb0ef] hover:bg-[#2d94cc] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Get Started For Free
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Custom animation for fade-in effect
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
`;

if (typeof window !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}