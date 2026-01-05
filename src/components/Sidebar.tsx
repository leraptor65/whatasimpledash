"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaCog, FaList, FaImage, FaCode, FaArrowLeft, FaPuzzlePiece, FaPalette } from 'react-icons/fa';

const navItems = [
    { name: 'General', href: '/settings', icon: FaCog },
    { name: 'Services', href: '/settings/services', icon: FaList },
    { name: 'Widgets', href: '/settings/widgets', icon: FaPuzzlePiece },
    { name: 'Theme', href: '/settings/theme', icon: FaPalette },
    { name: 'Backgrounds', href: '/settings/backgrounds', icon: FaImage },
    { name: 'Raw Editor', href: '/settings/raw', icon: FaCode },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 glass-panel h-screen flex flex-col fixed left-0 top-0 z-20">
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    <FaArrowLeft />
                </Link>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                    Settings
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <item.icon className={isActive ? 'text-cyan-400' : 'text-gray-500'} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-white/10">
                <p className="text-xs text-center text-gray-500">v2.0.0 Gemini Remix</p>
            </div>
        </div>
    );
}
