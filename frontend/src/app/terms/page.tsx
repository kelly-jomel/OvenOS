import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Terms of Service</h1>
        <div className="prose prose-invert text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            Welcome to CrumbLedger. By creating an account or accessing the CrumbLedger web application, you agree to these Terms.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">1. Subscription & Free Trial</h2>
          <p>
            CrumbLedger offers a 14-day free trial without requiring credit card information. Subscriptions are billed either monthly or annually as chosen during checkout. You may cancel your subscription at any time without penalty.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">2. Acceptable Use</h2>
          <p>
            You agree to use CrumbLedger for legitimate commercial or home bakery management and not for any unlawful activity.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">3. Limitation of Liability</h2>
          <p>
            CrumbLedger provides calculation tools and automated estimates. You maintain ultimate responsibility for setting final prices and maintaining food safety standards in your jurisdiction.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
