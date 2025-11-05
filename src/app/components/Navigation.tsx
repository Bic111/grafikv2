'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              Grafik
            </Link>

            <div className="flex space-x-4">
              <Link
                href="/schedule"
                className={`px-3 py-2 rounded ${
                  isActive('/schedule')
                    ? 'bg-gray-900'
                    : 'hover:bg-gray-700'
                }`}
              >
                Grafik
              </Link>

              <div className="relative group">
                <button
                  className={`px-3 py-2 rounded ${
                    isActive('/settings')
                      ? 'bg-gray-900'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  Ustawienia ▾
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg hidden group-hover:block z-10">
                  <Link
                    href="/settings/employees"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Pracownicy
                  </Link>
                  <Link
                    href="/settings/shifts"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Zmiany
                  </Link>
                  <Link
                    href="/settings/absences"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Nieobecności
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
