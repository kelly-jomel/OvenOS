import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Refund & Cancellation Policy</h1>
        <div className="prose prose-invert text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed">
          <p>
            At CrumbLedger, we want every baker to love using our software. If you are not satisfied, we make refunds and cancellations easy and hassle-free.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">30-Day Money-Back Guarantee</h2>
          <p>
            If within 30 days of your first paid billing date you decide CrumbLedger isn&apos;t right for your bakery, contact our support team at <a href="mailto:support@crumbledger.com" className="text-amber-400 underline">support@crumbledger.com</a>, and we will issue a full 100% refund without questions.
          </p>
          <h2 className="text-lg font-bold text-white mt-6">Cancellation at Any Time</h2>
          <p>
            You can cancel your subscription inside your account settings at any moment. Your access will remain active until the end of your billing cycle.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
