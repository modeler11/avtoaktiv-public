import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaLaugh, FaUser, FaEnvelope, FaTimes } from 'react-icons/fa';
import { useSections } from '../hooks/useSections';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [openSubMenus, setOpenSubMenus] = useState<{ [key: string]: boolean }>({});
  const { sections, isLoading } = useSections();

  const staticMenuItems = [
    { href: '/', label: 'Главная', icon: <FaHome className="w-5 h-5" /> },
    {
      href: '/jokes',
      label: 'Анекдоты',
      icon: <FaLaugh className="w-5 h-5" />,
      hasSubItems: true
    },
  ];

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <>
      {/* Затемнение фона на мобильных устройствах */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">TxtForge</h2>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-6 overflow-y-auto h-[calc(100vh-4rem)]">
          {staticMenuItems.map((item) => (
            <div key={item.href}>
              <button
                onClick={() => {
                  if (item.hasSubItems) {
                    toggleSubMenu(item.label);
                  } else {
                    router.push(item.href);
                    onClose();
                  }
                }}
                className={`w-full flex items-center px-6 py-3 transition-colors duration-200 ${
                  router.pathname === item.href 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </button>
              {item.hasSubItems && openSubMenus[item.label] && (
                <div className="bg-gray-800">
                  {isLoading ? (
                    <div className="pl-12 pr-6 py-2 text-gray-400">Загрузка...</div>
                  ) : (
                    sections.map((section) => (
                      <Link
                        key={section._id}
                        href={`/jokes/${section.slug}`}
                        onClick={onClose}
                        className={`flex items-center pl-12 pr-6 py-2 transition-colors duration-200 ${
                          router.pathname === `/jokes/${section.slug}`
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <span>{section.title}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar; 