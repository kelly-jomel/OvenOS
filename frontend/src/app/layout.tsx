import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/lib/AppContext";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "CrumbLedger | Recipe Costing & Bakery Management Operating System",
  description:
    "The all-in-one bakery management software for artisan bakers, patisseries, and micro-food creators. Gram-precision recipe costing, real-time inventory depletion, fast POS, and 70%+ margin protection.",
  keywords: [
    "bakery management software",
    "recipe costing calculator",
    "baker inventory tracking",
    "bakery POS system",
    "food cost percentage calculator",
    "patisserie profit margins",
  ],
  authors: [{ name: "CrumbLedger Technologies" }],
  openGraph: {
    title: "CrumbLedger | Stop Guessing Margins. Master Your Ledger.",
    description:
      "Gram-precision recipe costing, real-time pantry inventory depletion, fast counter POS, and tax invoicing for modern bakeries.",
    url: "https://www.crumbledger.com",
    siteName: "CrumbLedger",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrumbLedger | Recipe Costing & Bakery Management",
    description:
      "All-in-one software for artisan bakers. Master recipe costing, inventory alerts, and counter POS.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://www.crumbledger.com/" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "SoftwareApplication",
                  "name": "CrumbLedger",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web, iOS, Android",
                  "offers": {
                    "@type": "Offer",
                    "price": "5.00",
                    "priceCurrency": "USD",
                    "priceValidUntil": "2027-12-31",
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "248",
                  },
                  "description":
                    "Bakery recipe costing and pantry management software for artisan bakeries and pastry chefs.",
                },
                {
                  "@type": "Organization",
                  "name": "CrumbLedger",
                  "url": "https://www.crumbledger.com",
                  "logo": "https://www.crumbledger.com/logo.png",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "email": "support@crumbledger.com",
                    "contactType": "customer service",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="bg-[#0f172a] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
