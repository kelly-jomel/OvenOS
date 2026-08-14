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
  title: "CrumbLedger | Financial Software for Bakers",
  description: "Balance expansive, optimistic energy with the grounded structure required for financial software. Designed for home bakers.",
  keywords: "billing software for home bakers, invoice template for bakers, home bakery management software, CrumbLedger, cake order tracking app, collect bakery deposits online"
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
      </body>
    </html>
  );
}
