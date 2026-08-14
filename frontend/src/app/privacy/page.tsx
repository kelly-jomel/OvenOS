import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl shadow-sm border border-gray-200">
        <Link href="/" className="text-orange-600 hover:underline mb-8 inline-block">&larr; Back to Home</Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service to you:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Personal Data:</strong> Email address, first name, last name, phone number.</li>
              <li><strong>Business Data:</strong> Bakery details, inventory, financial transactions, and customer data you input into the ERP.</li>
              <li><strong>Usage Data:</strong> Information on how the Service is accessed and used.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use of Data</h2>
            <p>CrumbLedger uses the collected data for various purposes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Transfer of Data</h2>
            <p>Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Security of Data</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Service Providers</h2>
            <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. (e.g. Firebase, Vercel, Neon DB).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Links to Other Sites</h2>
            <p>Our Service may contain links to other sites that are not operated by us. If you click on a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
