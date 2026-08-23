"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Manual Journals" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Manual Journals" 
          collectionName="manual_journals" 
          fields={[
      { name: 'journalNumber', label: 'Journal #', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'reference', label: 'Reference', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published'] }
    ]} 
        />
      </main>
    </div>
  );
}
