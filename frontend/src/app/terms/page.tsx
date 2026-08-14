import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-200">
        <Link href="/" className="text-orange-600 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the CrumbLedger platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>CrumbLedger provides a cloud-based Bakery ERP and Point of Sale (POS) system, including inventory management, order tracking, and accounting tools.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. CrumbLedger cannot and will not be liable for any loss or damage arising from your failure to comply with this security obligation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data and Privacy</h2>
            <p>Your use of CrumbLedger is also governed by our Privacy Policy. By using CrumbLedger, you consent to the practices described in the Privacy Policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Subscription and Billing</h2>
            <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis according to your subscription plan.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>In no event shall CrumbLedger, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days notice prior to any new terms taking effect.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
