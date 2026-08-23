"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Credit Notes" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Credit Notes" 
          collectionName="credit_notes" 
          fields={[
      { name: 'creditNoteNumber', label: 'Credit Note #', type: 'text' },
      { name: 'customerName', label: 'Customer Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Open', 'Closed'] }
    ]} 
        />
      </main>
    </div>
  );
}
