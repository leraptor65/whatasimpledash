import { Sidebar } from '@/components/Sidebar';
import { ColorPickerProvider } from '@/contexts/ColorPickerContext';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ColorPickerProvider>
            <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
                <Sidebar />
                <main className="pl-64 min-h-screen">
                    <div className="max-w-4xl mx-auto p-8 lg:p-12">
                        {children}
                    </div>
                </main>
            </div>
        </ColorPickerProvider>
    );
}
