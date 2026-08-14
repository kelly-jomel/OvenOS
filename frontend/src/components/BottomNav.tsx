import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { name: 'Orders', path: '/orders', icon: '📝' },
    { name: 'Customers', path: '/parties', icon: '👥' },
    { name: 'Billing', path: '/billing', icon: '🧾' },
    { name: 'Recipes', path: '/recipes', icon: '🍲' },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed nav */}
      <div className="h-16 md:hidden"></div>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between px-2 pb-safe pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full py-1 text-xs ${
                isActive ? 'text-orange-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-900'
              }`}
            >
              <span className={`text-xl mb-1 ${isActive ? 'scale-110 transition-transform' : ''}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
