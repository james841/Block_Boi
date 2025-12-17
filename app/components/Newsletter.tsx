"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <section className="py-16 px-6 sm:px-8 lg:px-12 bg-gray-300">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Image Section */}
          <div className="w-full md:w-1/3 rounded-xl overflow-hidden shadow-md transform hover:scale-105 transition-transform duration-500">
            <img
              src="/images/block3.avif"
              alt="Beauty hand with cream"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Text and Form Section */}
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Beauty in Your Inbox
            </h2>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              Sign up for our newsletter and enjoy{" "}
              <span className="font-semibold text-orange-600">10% off</span> your
              first order — delivered straight to your inbox.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-1/3 bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 font-semibold shadow-md"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}