import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://autoviseblackcar.com"),
  title: {
    default: "Autovise Black Car | Nationwide Black Car Service",
    template: "%s | Autovise Black Car",
  },
  description:
    "Autovise Black Car provides nationwide luxury transportation with primary operations across Maine, Massachusetts, and New York. Airport transfers, executive travel, long-distance service, VIP transportation, and hourly chauffeur bookings.",
  keywords: [
    "black car service",
    "luxury transportation",
    "airport transfer",
    "chauffeur service",
    "executive car service",
    "private car service",
    "limo service",
    "black car Maine",
    "black car Massachusetts",
    "black car New York",
    "nationwide black car",
    "long distance car service",
    "VIP transportation",
    "Boston Logan airport transfer",
    "JFK airport transfer",
  ],
  authors: [{ name: "Autovise Black Car" }],
  creator: "Autovise Black Car",
  icons: {
    icon: [
      { url: "/favicon.ico",        sizes: "any" },
      { url: "/favicon-16x16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/favicon-32x32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icon.png",           sizes: "512x512", type: "image/png" },
    ],
    apple:    [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
    other:    [{ rel: "manifest", url: "/site.webmanifest" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  alternates: {
    canonical: "https://autoviseblackcar.com",
  },
  openGraph: {
    title: "Autovise Black Car | Nationwide Black Car Service",
    description:
      "Luxury. Reliability. Precision. Autovise Black Car delivers airport, executive, long-distance, VIP, and hourly chauffeur transportation nationwide.",
    url: "https://autoviseblackcar.com",
    type: "website",
    siteName: "Autovise Black Car",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Autovise Black Car — Nationwide Luxury Transportation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Autovise Black Car | Nationwide Black Car Service",
    description:
      "Nationwide luxury transportation with strong East Coast operations across Maine, Massachusetts, and New York.",
    creator: "@autoviseblackcar",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Autovise Black Car",
  description:
    "A premium nationwide black car service specializing in executive, airport, long-distance, event, and hourly transportation, with primary operations across Maine, Massachusetts, and New York.",
  url: "https://autoviseblackcar.com",
  telephone: "+12078803733",
  email: "booking@autoviseblackcar.com",
  address: {
    "@type": "PostalAddress",
    addressRegion: "ME",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "State", name: "Maine" },
    { "@type": "State", name: "Massachusetts" },
    { "@type": "State", name: "New York" },
    { "@type": "Country", name: "United States" },
  ],
  openingHours: "Mo-Su 00:00-23:59",
  priceRange: "$$",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Autovise Black Car Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Nationwide Airport Transfers",
          description:
            "Premium airport transfers to Boston Logan, JFK, LaGuardia, and airports nationwide.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Executive & Corporate Travel",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Long-Distance Private Travel",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Event & VIP Transportation",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hourly Chauffeur Service",
        },
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
