import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CrumbLedger | Recipe Costing & Bakery Management Software",
  description: "The ultimate bakery management software for home bakers. Accurately calculate recipe costs, track inventory, manage custom orders, and generate invoices in one place.",
  keywords: "bakery software, home bakery management, recipe costing app, cake pricing calculator, inventory tracker for bakers, invoice template for bakers, CrumbLedger, food costing",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png"
  },
  openGraph: {
    title: "CrumbLedger | Recipe Costing & Bakery Management Software",
    description: "The ultimate bakery management software for home bakers.",
    url: "https://www.crumbledger.com",
    siteName: "CrumbLedger",
    images: [
      {
        url: "https://www.crumbledger.com/logo.png",
        width: 800,
        height: 600,
      }
    ],
    locale: "en_US",
    type: "website",
  }
};

import { BakeryProvider } from "@/context/BakeryContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="min-h-full flex flex-col font-data">
        <BakeryProvider>
          {children}
        </BakeryProvider>
      </body>
    </html>
  );
}
