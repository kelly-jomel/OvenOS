import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
      <body className="min-h-full flex flex-col font-data">
        <BakeryProvider>
          {children}
        </BakeryProvider>
        <Analytics />
      </body>
    </html>
  );
}
