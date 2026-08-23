"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="e-Way Bills" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="e-Way Bills" 
          collectionName="eway_bills" 
          fields={[
      { name: 'ewayBillNumber', label: 'e-Way Bill #', type: 'text' },
      { name: 'customerName', label: 'Customer Name', type: 'text' },
      { name: 'date', label: 'Generated Date', type: 'date' },
      { name: 'validUntil', label: 'Valid Until', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Cancelled', 'Expired'] }
    ]} 
        />
      </main>
    </div>
  );
}
