import Link from 'next/link';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain hidden sm:block" />
          <div className="w-10 h-10 bg-orange-100 rounded-full flex sm:hidden items-center justify-center text-orange-600 font-bold text-xl">
            O
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
              OvenOS <span className="text-xs sm:text-sm font-normal text-gray-500">{title ? `/ ${title}` : ''}</span>
            </h1>
          </div>
        </Link>
        
        {/* Right side actions */}
        <div className="flex gap-4">
          <button className="text-gray-500 hover:text-gray-900 text-xl">🔍</button>
          <button className="text-gray-500 hover:text-gray-900 text-xl relative">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
