import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OvenOS | Billing & Invoicing Software for Home Bakers",
  description: "Streamline your home bakery business with OvenOS. Send professional invoices, collect advance deposits, and track custom cake orders effortlessly. Try it free!",
  keywords: "billing software for home bakers, invoice template for bakers, home bakery management software, OvenOS, cake order tracking app, collect bakery deposits online, how to invoice for custom cakes, small bakery software"
};

import { BakeryProvider } from "@/context/BakeryContext";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BakeryProvider>
          {children}
        </BakeryProvider>
      </body>
    </html>
  );
}
