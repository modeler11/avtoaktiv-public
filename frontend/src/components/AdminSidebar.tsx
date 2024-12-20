import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChartBar, FaLayerGroup, FaSignOutAlt, FaCog, FaRobot, FaNewspaper, FaCode } from 'react-icons/fa';

interface AdminSidebarProps {
  isOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  const router = useRouter();

  const menuItems = [
    { href: '/admin', label: 'Дашборд', icon: <FaChartBar className="w-5 h-5" /> },
    { href: '/admin/sections', label: 'Разделы', icon: <FaLayerGroup className="w-5 h-5" /> },
    { href: '/admin/ai-settings', label: 'Настройки AI', icon: <FaCog className="w-5 h-5" /> },
    { href: '/admin/content-generator', label: 'Автонаполнение', icon: <FaRobot className="w-5 h-5" /> },
    { href: '/admin/content', label: 'Статьи', icon: <FaNewspaper className="w-5 h-5" /> },
    { href: '/admin/code-injection', label: 'Вставка кода', icon: <FaCode className="w-5 h-5" /> },
    { href: '/logout', label: 'Выход', icon: <FaSignOutAlt className="w-5 h-5" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-900 text-white overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-xl font-bold">TxtForge Admin</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 transition-colors duration-200 ${
              router.pathname === item.href 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar; 