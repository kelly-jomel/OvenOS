"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Payments Received" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Payments Received" 
          collectionName="payments_received" 
          fields={[
      { name: 'paymentNumber', label: 'Payment #', type: 'text' },
      { name: 'customerName', label: 'Customer Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'amount', label: 'Amount Received', type: 'number' },
      { name: 'paymentMode', label: 'Payment Mode', type: 'select', options: ['Cash', 'Bank Transfer', 'Credit Card', 'Cheque'] }
    ]} 
        />
      </main>
    </div>
  );
}
