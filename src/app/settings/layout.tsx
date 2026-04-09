"use client";

import { useStore } from '@/store/useStore';
import { Sidebar } from '@/components/Sidebar';
import { ColorPickerProvider } from '@/contexts/ColorPickerContext';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen } = useStore();

  return (
    <ColorPickerProvider>
      <div className="min-h-screen bg-[#0e0e0e] text-[#e3e3e3] font-sans selection:bg-blue-500/30">
        <Sidebar />
        
        <main 
          className={`transition-all duration-300 flex-1 ${
            isSidebarOpen ? 'ml-64' : 'ml-16'
          } max-md:ml-0 max-md:pt-20 min-h-screen`}
        >
          <div className="max-w-4xl mx-auto w-full p-6 md:p-12">
            {children}
          </div>
        </main>
      </div>
    </ColorPickerProvider>
  );
}
