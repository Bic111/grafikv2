import Link from 'next/link';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <nav>
        <ul>
          <li className="mb-2"><Link href="/" className="hover:text-gray-300">Dashboard</Link></li>
          <li className="mb-2"><Link href="/schedule" className="hover:text-gray-300">Grafik</Link></li>
          <li className="mb-2"><Link href="/employees" className="hover:text-gray-300">Pracownicy</Link></li>
          <li className="mb-2"><Link href="/settings" className="hover:text-gray-300">Ustawienia</Link></li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
