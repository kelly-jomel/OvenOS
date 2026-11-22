import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            Last updated: November 2026. CrumbLedger Technologies Inc. (&ldquo;CrumbLedger&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal and proprietary business data.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">1. Information We Collect</h2>
          <p>
            We collect recipe formulas, ingredient inventories, sales transactions, and account details you provide directly to provide accurate bakery cost accounting.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">2. Data Ownership & Security</h2>
          <p>
            Your proprietary recipes, supplier costs, and customer records remain 100% your property. We never sell, rent, or monetize your bakery formulas. All cloud databases are encrypted at rest with AES-256 and transmitted using TLS 1.3.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">3. Contact Us</h2>
          <p>
            If you have questions about our privacy practices, email us at <a href="mailto:privacy@crumbledger.com" className="text-amber-400 underline">privacy@crumbledger.com</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
