import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./components/Footer";
import ClientProviders from "./components/ClientProvider";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import LayoutContent from "./components/LayoutContent";


const geist = localFont({
  src: [
    { path: "../public/fonts/Geist-Black.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Geist-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist",
});

const geistMono = localFont({
  src: [
    { path: "../public/fonts/Geist-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Geist-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Block Boi | Next App",
    template: "%s | Block Boi",
  },
  description: "Modern Shopping Website for Block Boi.",
  keywords: ["Shopping", "Clothing", "Block Boi", "Fashion", "Boutique"],
  authors: [{ name: "Block Boi Dev Team" }],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-gray-50 text-gray-900">
        <CurrencyProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ClientProviders>
              <LayoutContent>{children}</LayoutContent>
              <Footer />
            </ClientProviders>
          </ThemeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}