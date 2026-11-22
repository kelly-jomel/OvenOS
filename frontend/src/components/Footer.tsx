import React from "react";
import Link from "next/link";
import { ChefHat, Mail, Shield, FileText, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-850 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <ChefHat className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">CrumbLedger</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The modern operating system for artisan bakeries, pastry chefs, and micro-food creators. Accurate recipe costing and margin defense.
            </p>
            <div className="text-[11px] text-slate-500">
              Built for proud bakers worldwide.
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-amber-400 transition">Features</a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-amber-400 transition">Margin Calculator</a>
              </li>
              <li>
                <a href="#product-preview" className="hover:text-amber-400 transition">Platform Tour</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-amber-400 transition">Pricing</a>
              </li>
              <li>
                <Link href="/app" className="hover:text-amber-400 transition font-medium text-amber-400/90">
                  Launch Web App &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Compliance Pages */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Trust & Compliance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-amber-400 transition">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-amber-400 transition">
                  Security & Cloud Backups
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Channels */}
          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Contact & Support
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <a href="mailto:support@crumbledger.com" className="hover:text-white transition">
                  support@crumbledger.com
                </a>
              </li>
              <li className="text-[11px] text-slate-400">
                Support Hours: Mon-Sat, 8:00 AM - 7:00 PM EST
              </li>
              <li className="text-[11px] text-emerald-400 font-medium">
                • Average live chat response: &lt; 5 mins
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <div>
            &copy; 2026 CrumbLedger Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <Link href="/refunds" className="hover:underline">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
