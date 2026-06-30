"use client";

import { useEffect, useState } from "react";

const messages = [
  "Customer support via WhatsApp, Instagram and Email",
  "Need help with an order? Contact our support team",
  "Fast response on WhatsApp",
  "Reach us anytime through Email",
  "Follow us on Instagram for updates",
];

export default function SupportBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative border-b border-stone-900 bg-stone-950 text-white py-6 px-5 md:py-8 md:px-8 overflow-hidden shadow-sm">
      {/* Decorative ambient background blur element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-20 bg-orange-500/12 rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-center min-h-[32px]">
        <p
          key={index}
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 text-sm sm:text-base md:text-lg font-semibold tracking-[0.24em] uppercase text-stone-100 text-center"
        >
          {/* Accent dot indicator to anchor the eye */}
          <span className="inline-block w-2 h-2 rounded-full bg-orange-500 mr-3 mb-0.5 animate-pulse" />
          {messages[index]}
        </p>
      </div>
    </div>
  );
}