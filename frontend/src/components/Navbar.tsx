import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaLaugh, FaUser, FaEnvelope, FaBars } from 'react-icons/fa';

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const router = useRouter();

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-40 md:ml-64">
      <div className="container mx-auto flex justify-between items-center max-w-[calc(100%-2rem)]">
        <div className="flex items-center">
          <button 
            className="text-white hover:text-gray-300 md:hidden"
            onClick={onMenuToggle}
            aria-label="Открыть меню"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <Link 
            href="/" 
            className="text-white text-xl font-bold ml-4 hover:text-gray-300"
          >
            TxtForge
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-4">
          <Link href="/" className="text-white hover:text-gray-300">
            <FaHome className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 