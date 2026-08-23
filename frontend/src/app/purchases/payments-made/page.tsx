"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Payments Made" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Payments Made" 
          collectionName="payments_made" 
          fields={[
      { name: 'paymentNumber', label: 'Payment #', type: 'text' },
      { name: 'vendorName', label: 'Vendor Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'paymentMode', label: 'Mode', type: 'select', options: ['Cash', 'Bank Transfer', 'Credit Card', 'Cheque'] }
    ]} 
        />
      </main>
    </div>
  );
}
