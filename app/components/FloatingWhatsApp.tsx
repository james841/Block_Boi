"use client";

import { FaWhatsapp } from "react-icons/fa";

interface FloatingWhatsAppProps {
  phoneNumber: string;
  message?: string;
}

export default function FloatingWhatsApp({
  phoneNumber,
  message = "Hello, I need assistance.",
}: FloatingWhatsAppProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-green-500 p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
        <FaWhatsapp size={32} color="white" />
      </div>
    </a>
  );
}