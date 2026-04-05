import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Link from 'next/link';
import { LazyMotion, domAnimation } from 'framer-motion';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: '#090A0F',
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://grabme.lk'),
  title: "Grab Me | Find Verified Professionals in Sri Lanka",
  description: "Find NIC-verified electricians, plumbers, and handymen in Sri Lanka. Connect directly on WhatsApp with zero commission. Fast. Safe. Locally Managed.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Grab Me | Sri Lanka's Verified Service Directory",
    description: "Get connected with trusted local experts. No middleman. No commission.",
    url: "https://grabme.lk",
    siteName: "Grab Me",
    images: [
      {
        url: "/grabme.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grab Me | Verified Handymen",
    description: "Find trusted pros in Sri Lanka.",
    images: ["/grabme.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
        
        {/* Global Legal Footer */}
        <footer className="mt-auto border-t border-white/5 bg-[#090A0F] py-12 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
              <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-white/10">
                <img src="/grabme.png" alt="Grab Me" width="24" height="24" loading="lazy" className="object-cover" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Grab Me</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Conduct', href: '/conduct' },
                { label: 'Directory', href: '/browse' },
              ].map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className="text-xs font-black uppercase tracking-[0.2em] text-white/20 hover:text-indigo-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="text-xs font-black uppercase tracking-[0.2em] text-white/10">
              © 2026 Mr² Labs
            </div>
          </div>
        </footer>

        <Toaster theme="dark" richColors position="bottom-center" />
      </body>
    </html>
  );
}
