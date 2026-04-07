import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import Link from 'next/link';
import { LazyMotion, domAnimation } from 'framer-motion';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.grabme.page'),
  title: {
    default: "Grab Me | Find Verified Workers in Sri Lanka",
    template: "%s | Grab Me"
  },
  description: "Find NIC-verified electricians, plumbers, and AC technicians in Sri Lanka. Connect directly on WhatsApp with zero commission. Fast. Safe. Locally Managed.",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: "/grabme.png",
    apple: "/grabme.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Grab Me | Find Verified Workers in Sri Lanka",
    description: "Get connected with trusted local experts. No middleman. No commission. NIC verified for your safety.",
    url: "https://www.grabme.page",
    siteName: "Grab Me",
    images: [
      {
        url: "/grabme.png",
        width: 1200,
        height: 630,
        alt: "Grab Me Sri Lanka"
      },
    ],
    locale: "en_LK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grab Me | Find Verified Workers in Sri Lanka",
    description: "Find trusted NIC-verified pros in Sri Lanka via WhatsApp.",
    images: ["/grabme.png"],
  },
  verification: {
    google: 'your-google-verification-code', // Placeholder for user
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data (JSON-LD) for LocalBusiness
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Grab Me",
    "image": "https://www.grabme.page/grabme.png",
    "description": "Sri Lanka's verified home services directory connecting homeowners with trusted professionals.",
    "url": "https://www.grabme.page",
    "telephone": "+94719382296", // Update with actual if available
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Colombo",
      "addressLocality": "Colombo",
      "addressRegion": "Western Province",
      "postalCode": "00100",
      "addressCountry": "LK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 6.9271,
      "longitude": 79.8612
    },
    "url_google_maps": "https://www.google.com/maps", // Update if available
    "sameAs": [
      "https://www.facebook.com/grabme",
      "https://www.instagram.com/grabme"
    ],
    "priceRange": "$$"
  };

  return (
    <html
      lang="en-LK"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>

        <Toaster theme="light" richColors position="bottom-center" />
      </body>
    </html>
  );
}
