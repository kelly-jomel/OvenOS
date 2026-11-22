"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: "How does CrumbLedger calculate ingredient cost per gram or milliliter?",
    a: "When you enter a bulk purchase (for instance, a 5kg bag of flour for $18), CrumbLedger automatically computes the exact per-gram unit cost ($0.0036/g). When creating recipes, you simply specify 600g of flour, and the exact cost ($2.16) is factored in without spreadsheets.",
  },
  {
    q: "Can I include baker labor and utility overheads?",
    a: "Yes! Unlike basic recipe calculators, CrumbLedger lets you set an hourly labor wage and specify prep/bake time. It also allows adding packaging costs (cake boxes, ribbon, boards) and electricity overhead to protect your true 70%+ gross margin.",
  },
  {
    q: "Does selling an item at POS automatically deduct raw ingredients?",
    a: "Yes. When you punch an order for 2 Chocolate Fudge Cakes at your counter POS, CrumbLedger instantly deducts the proportional grams of cocoa powder, butter, sugar, flour, and packaging boxes from your live pantry inventory.",
  },
  {
    q: "What currencies does CrumbLedger support?",
    a: "CrumbLedger natively supports USD ($), Indian Rupee (₹), British Pound (£), and Euro (€), with localized number formatting, currency symbols, and regional tax invoicing.",
  },
  {
    q: "Can I use CrumbLedger on my iPad, tablet, or phone?",
    a: "Absolutely. CrumbLedger is fully responsive and optimized for touchscreens. Many bakeries use an iPad at the sales counter as their POS terminal while owners manage recipes on a laptop.",
  },
  {
    q: "Is there a free trial? Do I need a credit card?",
    a: "We offer a 14-day free trial with full access to all features. No credit card is required to begin.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section id="faq" className="py-24 bg-slate-950 text-white border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Everything you need to know about setting up your bakery ledger.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left text-sm sm:text-base font-semibold text-slate-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
