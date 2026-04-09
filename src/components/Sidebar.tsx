"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaCog, FaThList, FaSearch, FaChevronLeft, FaChevronRight, FaBars, FaTimes, FaHome, FaPlus, FaPuzzlePiece, FaImage, FaIcons, FaCode } from 'react-icons/fa';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

const sidebarItems = [
  { name: 'Home', href: '/', icon: FaHome },
  { name: 'General Settings', href: '/settings', icon: FaCog },
  { name: 'Services', href: '/settings/services', icon: FaThList },
  { name: 'Backgrounds', href: '/settings/backgrounds', icon: FaImage },
  { name: 'Icons', href: '/settings/icons', icon: FaIcons },
  { name: 'Raw YAML', href: '/settings/raw', icon: FaCode },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !isSidebarOpen && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2.5 bg-[#1a1a1a] text-white rounded-full shadow-lg border border-white/5"
        >
          <FaBars size={20} />
        </button>
      )}

      {/* Sidebar Overlay (Mobile only) */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0e0e0e] flex flex-col ${
          isSidebarOpen ? 'w-64' : (isMobile ? 'w-64' : 'w-20')
        } ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'p-6 justify-between' : 'p-4 py-6 justify-center'}`}>
          {isSidebarOpen && <div className="flex-1"></div>}
          <button 
            onClick={toggleSidebar}
            className={`p-2 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition-colors flex items-center justify-center ${!isSidebarOpen ? 'w-full' : ''}`}
          >
            {isSidebarOpen ? (isMobile ? <FaTimes /> : <FaChevronLeft />) : <FaChevronRight />}
          </button>
        </div>

        <nav className={`flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-2 flex flex-col items-center'}`}>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl transition-all group ${
                  isSidebarOpen ? 'gap-4 px-3 py-3 w-full' : 'p-3 w-full justify-center'
                } ${
                  isActive 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'hover:bg-white/5 text-white/50 hover:text-white'
                }`}
                title={!isSidebarOpen ? item.name : ''}
              >
                <div className="flex-shrink-0 flex items-center justify-center">
                  <Icon size={20} className={isActive ? 'text-white' : 'opacity-80'} />
                </div>
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
                  isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto"></div>
      </aside>
    </>
  );
};
