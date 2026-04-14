import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

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
  title: "Autovise Black Car | Nationwide Luxury Transportation — East Coast Based",
  description:
    "Premium black car service across the United States. Airport transfers to BOS, JFK, LGA and beyond. Executive travel, long-distance, and VIP transportation. Based on the East Coast — Maine, Massachusetts, New York. Licensed, insured, available 24/7.",
  openGraph: {
    title: "Autovise Black Car | Nationwide Luxury Transportation",
    description:
      "Premium black car service across the United States. Airport transfers, executive travel, long-distance, and VIP transportation. Based on the East Coast — available nationwide.",
    type: "website",
    siteName: "Autovise Black Car",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autovise Black Car | Nationwide Luxury Transportation",
    description:
      "Premium black car service coast to coast. BOS, JFK, LGA transfers. Executive, long-distance, and VIP transportation. Available 24/7.",
  },
  metadataBase: new URL("https://anytime-anywhere-limo.vercel.app"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Autovise Black Car",
  "description": "Nationwide premium black car service based on the East Coast. Airport transfers to BOS, JFK, LGA and beyond. Executive travel, long-distance, VIP, and event transportation across Maine, Massachusetts, New York, and nationwide.",
  "url": "https://anytime-anywhere-limo.vercel.app",
  "telephone": "(207) 000-0000",
  "email": "book@autovise.com",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "ME",
    "addressCountry": "US"
  },
  "areaServed": [
    { "@type": "State", "name": "Maine" },
    { "@type": "State", "name": "Massachusetts" },
    { "@type": "State", "name": "New York" },
    { "@type": "Country", "name": "United States" }
  ],
  "openingHours": "Mo-Su 00:00-23:59",
  "priceRange": "$$",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Autovise Black Car Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nationwide Airport Transfers", "description": "Premium black car transfers to BOS, JFK, LGA, and airports nationwide." }, "price": "650", "priceCurrency": "USD" },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Executive & Corporate Travel" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Long-Distance Private Travel" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Event & VIP Transportation" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Hourly Chauffeur Service" }, "price": "110", "priceCurrency": "USD" }
    ]
  },
  "vehicle": {
    "@type": "Vehicle",
    "name": "GMC Yukon Denali",
    "vehicleSeatingCapacity": "6"
  }
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
