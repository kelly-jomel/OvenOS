"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Saved Reports" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Saved Reports" 
          collectionName="saved_reports" 
          fields={[
      { name: 'reportName', label: 'Report Name', type: 'text' },
      { name: 'type', label: 'Report Type', type: 'select', options: ['Profit & Loss', 'Balance Sheet', 'Cash Flow', 'Tax Summary'] },
      { name: 'dateGenerated', label: 'Date Generated', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['Ready', 'Processing'] }
    ]} 
        />
      </main>
    </div>
  );
}
