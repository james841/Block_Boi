"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle,
  MessageCircle,
  Globe,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Form submitted:", formData);

    setIsSubmitting(false);
    setIsSubmitted(true);
    
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative pt-24 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-600">24/7 Support Available</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400">
            Let's Connect
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions? We're here to help. Send us a message and we'll respond within 24 hours.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {/* Location Card */}
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                
              </div>

              {/* Phone Card */}
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Call Us</h3>
                  <div className="space-y-2 mb-4">
                    <a href="tel:+2349021080632" className="block text-lg text-gray-600 hover:text-orange-600 transition-colors font-medium">
                      +234 902 108 0632
                    </a>
                    <a href="tel:+2349021080632" className="block text-lg text-gray-600 hover:text-orange-600 transition-colors font-medium">
                      +234 902 108 0632
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">Sun - Sat: 9:00 AM - 8:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Email Us</h3>
                  <div className="space-y-2">
                    <a href="mailto:blockboicouture@gmail.com" className="block text-lg text-gray-600 hover:text-orange-600 transition-colors font-medium">
                      blockboicouture@gmail.com
                    </a>
                    <a href="mailto:blockboicouture@gmail.com" className="block text-lg text-gray-600 hover:text-orange-600 transition-colors font-medium">
                      blockboicouture@gmail.com
                    </a>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">We typically respond within 2-4 hours</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">Follow Us</h3>
                  </div>
                  <p className="text-orange-100 mb-6">Stay updated with our latest products and offers</p>
                  <div className="flex gap-4">
                    <a href="https://www.tiktok.com/@blocboi_?_t=ZM-90rsQeCzjTc&_r=1" className="w-14 h-14 bg-white/20 backdrop-blur-sm hover:bg-white hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg" aria-label="Facebook">
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a href="https://www.instagram.com/__block.boi?igsh=bDJ1cHJyamk3c3hx&utm_source=qr" className="w-14 h-14 bg-white/20 backdrop-blur-sm hover:bg-white hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg" aria-label="Instagram">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href="https://x.com/thblockboii?s=21" className="w-14 h-14 bg-white/20 backdrop-blur-sm hover:bg-white hover:text-orange-600 rounded-2xl flex items-center justify-center transition-all hover:scale-110 shadow-lg" aria-label="Twitter">
                      <Twitter className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border-2 border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                    Send Us a Message
                  </h2>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-gray-900">Message Sent!</h3>
                    <p className="text-xl text-gray-600 mb-2">Thank you for reaching out to us.</p>
                    <p className="text-gray-500">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Your Name <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Email Address <span className="text-orange-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Subject <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">
                        Message <span className="text-orange-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                        placeholder="Write your message here..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="mt-16">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gray-100">
              <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  Find Us Here
                </h3>
              </div>
              <div className="h-96 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.158308694!2d-74.119763!3d40.697663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2sbd!4v1547528322718"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}