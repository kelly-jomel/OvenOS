"use client";
import SideNav from "@/components/SideNav";
import GenericModule from "@/components/GenericModule";

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Sales Orders" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <GenericModule 
          title="Sales Orders" 
          collectionName="sales_orders" 
          fields={[
      { name: 'orderNumber', label: 'Order #', type: 'text' },
      { name: 'customerName', label: 'Customer Name', type: 'text' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['Draft', 'Confirmed', 'Closed'] }
    ]} 
        />
      </main>
    </div>
  );
}
