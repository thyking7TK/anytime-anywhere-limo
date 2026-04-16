import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import PageTransition from "./_components/page-transition";

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
  title: "Autovise Black Car | Nationwide Black Car Service - East Coast Based",
  description:
    "Autovise Black Car provides nationwide luxury transportation with primary operations across Maine, Massachusetts, and New York. Airport transfers, executive travel, long-distance service, VIP transportation, and hourly chauffeur bookings.",
  openGraph: {
    title: "Autovise Black Car | Nationwide Black Car Service",
    description:
      "Luxury. Reliability. Precision. Autovise Black Car delivers airport, executive, long-distance, VIP, and hourly chauffeur transportation nationwide.",
    type: "website",
    siteName: "Autovise Black Car",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autovise Black Car | Nationwide Black Car Service",
    description:
      "Nationwide luxury transportation with strong East Coast operations across Maine, Massachusetts, and New York.",
  },
  metadataBase: new URL("https://autoviseblackcar.com"),
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
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
