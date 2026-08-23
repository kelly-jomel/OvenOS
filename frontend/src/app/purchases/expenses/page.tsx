"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Expenses" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Expenses" 
          collectionName="expenses" 
          fields={[
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'select', options: ['Ingredients', 'Packaging', 'Shipping', 'Marketing', 'Other'] },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'reference', label: 'Reference #', type: 'text' }
    ]} 
        />
      </main>
    </div>
  );
}
