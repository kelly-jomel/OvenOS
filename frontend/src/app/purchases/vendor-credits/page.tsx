"use client";
import SideNav from '@/components/SideNav';

export default function Page() {
  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Vendor Credits" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Credits</h1>
            <p className="text-slate-500 text-sm mt-1">This module is coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
