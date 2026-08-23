"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Recurring Bills" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Recurring Bills" 
          collectionName="recurring_bills" 
          fields={[
      { name: 'profileName', label: 'Profile Name', type: 'text' },
      { name: 'vendorName', label: 'Vendor', type: 'text' },
      { name: 'frequency', label: 'Frequency', type: 'select', options: ['Weekly', 'Monthly', 'Yearly'] },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Paused'] }
    ]} 
        />
      </main>
    </div>
  );
}
