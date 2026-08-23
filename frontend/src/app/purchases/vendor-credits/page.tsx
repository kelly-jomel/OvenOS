"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Vendor Credits" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Vendor Credits" 
          collectionName="vendor_credits" 
          fields={[
      { name: 'creditNumber', label: 'Credit #', type: 'text' },
      { name: 'vendorName', label: 'Vendor Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed'] }
    ]} 
        />
      </main>
    </div>
  );
}
